package com.blog.mapper;

import com.blog.model.entity.Guestbook;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GuestbookMapper extends com.blog.mapper.BaseMapper<Guestbook> {
}

