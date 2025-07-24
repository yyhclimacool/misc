from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db, Event as DBEvent, Tag as DBTag
from ..models import (
    Event,
    EventCreate,
    EventUpdate,
    TimelineResponse,
    SearchRequest,
    Tag,
)
from ..services.tag_extractor import TagExtractor

router = APIRouter(prefix="/api/events", tags=["events"])
tag_extractor = TagExtractor()


@router.post("/", response_model=Event)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    """创建新事件"""

    # 自动提取标签
    full_text = f"{event.title} {event.description or ''}"
    extracted_tags = tag_extractor.extract_tags(full_text)

    # 自动推断分类
    auto_category = tag_extractor.get_category(extracted_tags)

    # 自动评估重要性
    impact_score = tag_extractor.get_importance_score(full_text)

    # 合并用户提供的标签和自动提取的标签
    user_tags = event.tags.split(",") if event.tags else []
    all_tags = list(set(user_tags + extracted_tags))

    db_event = DBEvent(
        title=event.title,
        description=event.description,
        event_date=event.event_date or datetime.utcnow(),
        tags=",".join(all_tags),
        category=event.category or auto_category,
        impact_score=impact_score,
    )

    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    # 保存新标签到标签表
    for tag_name in all_tags:
        existing_tag = db.query(DBTag).filter(DBTag.name == tag_name).first()
        if not existing_tag:
            db_tag = DBTag(name=tag_name, category=auto_category)
            db.add(db_tag)

    db.commit()
    return db_event


@router.get("/timeline", response_model=TimelineResponse)
def get_timeline(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """获取时间线事件"""
    query = db.query(DBEvent)

    if category:
        query = query.filter(DBEvent.category == category)

    # 按事件日期降序排列
    query = query.order_by(DBEvent.event_date.desc())

    # 分页
    total = query.count()
    events = query.offset((page - 1) * size).limit(size).all()

    return TimelineResponse(events=events, total=total, page=page, size=size)


@router.get("/search", response_model=List[Event])
def search_events(
    query: Optional[str] = None,
    tags: Optional[str] = Query(None, description="逗号分隔的标签"),
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    impact_level: Optional[str] = Query(
        None, description="影响力级别: high, medium, low"
    ),
    db: Session = Depends(get_db),
):
    """搜索事件"""
    db_query = db.query(DBEvent)

    if query:
        db_query = db_query.filter(
            (DBEvent.title.contains(query)) | (DBEvent.description.contains(query))
        )

    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        for tag in tag_list:
            db_query = db_query.filter(DBEvent.tags.contains(tag))

    if category:
        db_query = db_query.filter(DBEvent.category == category)

    if start_date:
        db_query = db_query.filter(DBEvent.event_date >= start_date)

    if end_date:
        db_query = db_query.filter(DBEvent.event_date <= end_date)

    if impact_level:
        if impact_level == "high":
            db_query = db_query.filter(DBEvent.impact_score >= 7)
        elif impact_level == "medium":
            db_query = db_query.filter(
                DBEvent.impact_score >= 4, DBEvent.impact_score < 7
            )
        elif impact_level == "low":
            db_query = db_query.filter(DBEvent.impact_score < 4)

    return db_query.order_by(DBEvent.event_date.desc()).limit(50).all()


@router.get("/{event_id}", response_model=Event)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """获取单个事件"""
    event = db.query(DBEvent).filter(DBEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="事件未找到")
    return event


@router.put("/{event_id}", response_model=Event)
def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_db)):
    """更新事件"""
    db_event = db.query(DBEvent).filter(DBEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="事件未找到")

    update_data = event.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """删除事件"""
    db_event = db.query(DBEvent).filter(DBEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="事件未找到")

    db.delete(db_event)
    db.commit()
    return {"message": "事件已删除"}


@router.get("/stats/categories")
def get_categories_stats(db: Session = Depends(get_db)):
    """获取分类统计"""
    from sqlalchemy import func

    stats = (
        db.query(DBEvent.category, func.count(DBEvent.id))
        .group_by(DBEvent.category)
        .all()
    )
    return [{"category": category, "count": count} for category, count in stats]


@router.get("/stats/timeline")
def get_timeline_stats(db: Session = Depends(get_db)):
    """获取时间线统计"""
    from sqlalchemy import func, extract

    # 按月统计
    monthly_stats = (
        db.query(
            extract("year", DBEvent.event_date).label("year"),
            extract("month", DBEvent.event_date).label("month"),
            func.count(DBEvent.id).label("count"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    return [
        {
            "year": int(year),
            "month": int(month),
            "count": count,
            "date": f"{int(year)}-{int(month):02d}",
        }
        for year, month, count in monthly_stats
    ]
