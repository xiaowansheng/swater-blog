package com.blog.modules.archive.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.archive.service.ArchivePublicService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ArchivePublicServiceImpl implements ArchivePublicService {
    @Autowired
    private ArticleMapper articleMapper;

    @Override
    public List<ArchiveVO> list() {
        List<Map<String, Object>> statistics = articleMapper.selectArchiveStatistics();
        return statistics.stream().map(stat -> {
            ArchiveVO vo = new ArchiveVO();
            vo.setYear(((Number) stat.get("year")).intValue());
            vo.setMonth(((Number) stat.get("month")).intValue());
            vo.setPostCount(((Number) stat.get("postCount")).intValue());
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public PageResult<ArticleVO> getArticlesByYearAndMonth(Integer year, Integer month, Long page, Long size) {
        Page<Article> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, 1);
        if (year != null) {
            wrapper.apply("YEAR(published_at) = {0}", year);
        }
        if (month != null) {
            wrapper.apply("MONTH(published_at) = {0}", month);
        }
        wrapper.orderByDesc(Article::getPublishedAt);

        Page<Article> result = articleMapper.selectPage(pageParam, wrapper);
        List<ArticleVO> voList = result.getRecords().stream()
                .map(article -> BeanUtil.copyProperties(article, ArticleVO.class))
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }
}
