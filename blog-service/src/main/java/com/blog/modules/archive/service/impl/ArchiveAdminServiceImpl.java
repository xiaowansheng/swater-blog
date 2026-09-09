package com.blog.modules.archive.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.archive.service.ArchiveAdminService;
import com.blog.shared.PageResult;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ArchiveAdminServiceImpl implements ArchiveAdminService {
    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArchiveArticleConverter articleConverter;

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

    @Override
    public PageResult<ArticleVO> listArticlesByMonth(int year, int month, Long page, Long size) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);

        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(Article::getCreateTime, start)
                .lt(Article::getCreateTime, end)
                .orderByDesc(Article::getCreateTime);

        Page<Article> result = articleMapper.selectPage(PageUtil.buildPage(page, size), wrapper);
        List<ArticleVO> voList = articleConverter.convertToListVO(result.getRecords());
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }
}
