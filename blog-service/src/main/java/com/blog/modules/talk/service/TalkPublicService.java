package com.blog.modules.talk.service;


import com.blog.shared.PageResult;
import com.blog.modules.talk.model.vo.TalkVO;
public interface TalkPublicService {
    PageResult<TalkVO> list(Long page, Long size);

    TalkVO getById(Long id);

    TalkVO getByKey(String key);

    /**
     * 批量获取说说统计（只读，不增加浏览数）；未发布/已删除的 id 不返回。
     */
    java.util.List<com.blog.modules.talk.model.vo.MomentStatsVO> getStatsByIds(java.util.List<Long> ids);

    /**
     * 获取单条说说统计（只读），不存在返回 null。
     */
    com.blog.modules.talk.model.vo.MomentStatsVO getTalkStats(Long id);
}
