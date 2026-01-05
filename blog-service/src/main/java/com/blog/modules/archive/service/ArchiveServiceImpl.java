package com.blog.modules.archive.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.archive.mapper.ArchiveMapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.archive.model.entity.Archive;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.archive.service.ArchiveService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
public class ArchiveServiceImpl implements ArchiveService {
    @Autowired
    private ArchiveMapper archiveMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Override
    public List<ArchiveVO> list() {
        LambdaQueryWrapper<Archive> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Archive::getYear);
        wrapper.orderByDesc(Archive::getMonth);
        List<Archive> archives = archiveMapper.selectList(wrapper);
        return BeanUtil.copyList(archives, ArchiveVO.class);
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

    @Override
    @Transactional
    public void regenerate() {
        LambdaQueryWrapper<Archive> wrapper = new LambdaQueryWrapper<>();
        List<Archive> archives = archiveMapper.selectList(wrapper);
        for (Archive archive : archives) {
            archiveMapper.deleteById(archive.getId());
        }
        
        LambdaQueryWrapper<Article> articleWrapper = new LambdaQueryWrapper<>();
        articleWrapper.eq(Article::getStatus, 1);
        articleWrapper.isNotNull(Article::getPublishedAt);
        List<Article> articles = articleMapper.selectList(articleWrapper);
        
        Map<String, Integer> archiveMap = new HashMap<>();
        for (Article article : articles) {
            LocalDateTime publishedAt = article.getPublishedAt();
            if (publishedAt != null) {
                int year = publishedAt.getYear();
                int month = publishedAt.getMonthValue();
                String key = year + "_" + month;
                archiveMap.put(key, archiveMap.getOrDefault(key, 0) + 1);
            }
        }
        
        for (Map.Entry<String, Integer> entry : archiveMap.entrySet()) {
            String[] parts = entry.getKey().split("_");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            
            Archive archive = new Archive();
            archive.setYear(year);
            archive.setMonth(month);
            archive.setPostCount(entry.getValue());
            archiveMapper.insert(archive);
        }
    }
}

