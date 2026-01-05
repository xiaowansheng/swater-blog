package com.blog.modules.guestbook.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.guestbook.model.entity.Guestbook;
import org.apache.ibatis.annotations.Mapper;
@Mapper
public interface GuestbookMapper extends com.blog.shared.model.BaseMapper<Guestbook> {
}

