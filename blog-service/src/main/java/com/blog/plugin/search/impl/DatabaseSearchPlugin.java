package com.blog.plugin.search.impl;

import com.blog.common.PageResult;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CommentMapper;
import com.blog.mapper.TalkMapper;
import com.blog.model.entity.Article;
import com.blog.model.entity.Comment;
import com.blog.model.entity.Talk;
import com.blog.model.vo.SearchVO;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.search.SearchPlugin;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@ConditionalOnProperty(name = "search.provider.type", havingValue = "database", matchIfMissing = false)
public class DatabaseSearchPlugin implements SearchPlugin, Plugin {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Override
    public String getName() {
        return "database";
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size) {
        if (type == null || type.isEmpty() || "all".equals(type)) {
            return searchAll(keyword, page, size);
        } else if ("post".equals(type)) {
            return searchPosts(keyword, page, size);
        } else if ("moment".equals(type)) {
            return searchMoments(keyword, page, size);
        } else if ("comment".equals(type)) {
            return searchComments(keyword, page, size);
        }
        return new PageResult<>(new ArrayList<>(), 0L, size, page);
    }

    private PageResult<SearchVO> searchAll(String keyword, Long page, Long size) {
        PageResult<SearchVO> postResults = searchPosts(keyword, page, size);
        PageResult<SearchVO> momentResults = searchMoments(keyword, page, size);
        PageResult<SearchVO> commentResults = searchComments(keyword, page, size);

        List<SearchVO> allResults = new ArrayList<>();
        allResults.addAll(postResults.getRecords());
        allResults.addAll(momentResults.getRecords());
        allResults.addAll(commentResults.getRecords());
        long total = postResults.getTotal() + momentResults.getTotal() + commentResults.getTotal();

        return new PageResult<>(allResults, total, size, page);
    }

    private PageResult<SearchVO> searchPosts(String keyword, Long page, Long size) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.like(Article::getTitle, keyword)
                .or().like(Article::getContent, keyword)
                .or().like(Article::getExcerpt, keyword));
        wrapper.eq(Article::getDeleted, 0);
        wrapper.orderByDesc(Article::getCreateTime);

        Page<Article> pageObj = new Page<>(page, size);
        Page<Article> result = articleMapper.selectPage(pageObj, wrapper);

        List<SearchVO> voList = result.getRecords().stream()
                .map(article -> {
                    SearchVO vo = new SearchVO();
                    vo.setType("post");
                    vo.setId(article.getId());
                    vo.setTitle(article.getTitle());
                    vo.setContent(article.getContent());
                    vo.setExcerpt(article.getExcerpt());
                    if (article.getCreateTime() != null) {
                        vo.setCreateTime(article.getCreateTime().toString());
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), size, page);
    }

    private PageResult<SearchVO> searchMoments(String keyword, Long page, Long size) {
        LambdaQueryWrapper<Talk> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(Talk::getContent, keyword);
        wrapper.eq(Talk::getDeleted, 0);
        wrapper.orderByDesc(Talk::getCreateTime);

        Page<Talk> pageObj = new Page<>(page, size);
        Page<Talk> result = talkMapper.selectPage(pageObj, wrapper);

        List<SearchVO> voList = result.getRecords().stream()
                .map(talk -> {
                    SearchVO vo = new SearchVO();
                    vo.setType("moment");
                    vo.setId(talk.getId());
                    vo.setContent(talk.getContent());
                    if (talk.getCreateTime() != null) {
                        vo.setCreateTime(talk.getCreateTime().toString());
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), size, page);
    }

    private PageResult<SearchVO> searchComments(String keyword, Long page, Long size) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(Comment::getContent, keyword);
        wrapper.eq(Comment::getDeleted, 0);
        wrapper.orderByDesc(Comment::getCreateTime);

        Page<Comment> pageObj = new Page<>(page, size);
        Page<Comment> result = commentMapper.selectPage(pageObj, wrapper);

        List<SearchVO> voList = result.getRecords().stream()
                .map(comment -> {
                    SearchVO vo = new SearchVO();
                    vo.setType("comment");
                    vo.setId(comment.getId());
                    vo.setContent(comment.getContent());
                    if (comment.getCreateTime() != null) {
                        vo.setCreateTime(comment.getCreateTime().toString());
                    }
                    return vo;
                })
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), size, page);
    }

    @Override
    public void indexDocument(String indexType, Long id, String document) throws Exception {
    }

    @Override
    public void deleteDocument(String indexType, Long id) throws Exception {
    }

    @Override
    public void bulkIndexDocuments(String indexType, List<Map<String, Object>> documents) throws Exception {
    }
}

