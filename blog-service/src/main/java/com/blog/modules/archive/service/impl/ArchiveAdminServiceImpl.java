package com.blog.modules.archive.service.impl;

import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.archive.service.ArchiveAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ArchiveAdminServiceImpl implements ArchiveAdminService {
    @Autowired
    private ArticleMapper articleMapper;

    @Override
    public List<ArchiveVO> listAll() {
        List<Map<String, Object>> statistics = articleMapper.selectAllArchiveStatistics();
        return statistics.stream().map(stat -> {
            ArchiveVO vo = new ArchiveVO();
            vo.setYear(((Number) stat.get("year")).intValue());
            vo.setMonth(((Number) stat.get("month")).intValue());
            vo.setPostCount(((Number) stat.get("postCount")).intValue());
            vo.setPublishedCount(((Number) stat.get("publishedCount")).intValue());
            vo.setDraftCount(((Number) stat.get("draftCount")).intValue());
            vo.setPrivateCount(((Number) stat.get("privateCount")).intValue());
            return vo;
        }).collect(Collectors.toList());
    }
}
