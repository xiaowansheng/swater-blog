package com.blog.modules.search.service;



import com.blog.shared.PageResult;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.search.model.vo.SearchVO;
import com.blog.modules.search.service.SearchService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class DatabaseSearchServiceImpl implements SearchService {
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private TalkMapper talkMapper;
    
    @Autowired
    private CommentMapper commentMapper;
    
    @Override
    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size) {
        List<SearchVO> results = new ArrayList<>();
        long total = 0;
        
        if (type == null || type.isEmpty() || "all".equals(type)) {
            PageResult<SearchVO> postResults = searchPosts(keyword, page, size);
            PageResult<SearchVO> momentResults = searchMoments(keyword, page, size);
            PageResult<SearchVO> commentResults = searchComments(keyword, page, size);
            
            results.addAll(postResults.getRecords());
            results.addAll(momentResults.getRecords());
            results.addAll(commentResults.getRecords());
            total = postResults.getTotal() + momentResults.getTotal() + commentResults.getTotal();
        } else if ("post".equals(type)) {
            return searchPosts(keyword, page, size);
        } else if ("moment".equals(type)) {
            return searchMoments(keyword, page, size);
        } else if ("comment".equals(type)) {
            return searchComments(keyword, page, size);
        }
        
        return new PageResult<>(results, total, size, page);
    }
    
    private PageResult<SearchVO> searchPosts(String keyword, Long page, Long size) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.like(Article::getTitle, keyword)
                .or().like(Article::getContent, keyword)
                .or().like(Article::getExcerpt, keyword));
        wrapper.orderByDesc(Article::getCreateTime);
        
        Page<Article> pageObj = new Page<>(page, size);
        Page<Article> result = articleMapper.selectPage(pageObj, wrapper);
        
        List<SearchVO> voList = result.getRecords().stream()
                .map(article -> {
                    SearchVO vo = new SearchVO();
                    vo.setType("post");
                    vo.setId(article.getId());
                    vo.setArticleKey(article.getArticleKey());
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
        wrapper.orderByDesc(Comment::getCreateTime);
        
        Page<Comment> pageObj = new Page<>(page, size);
        Page<Comment> result = commentMapper.selectPage(pageObj, wrapper);
        
        List<SearchVO> voList = result.getRecords().stream()
                .map(comment -> {
                    SearchVO vo = new SearchVO();
                    vo.setType("comment");
                    vo.setId(comment.getId());
                    vo.setContent(comment.getContent());
                    vo.setTargetId(comment.getTargetId());
                    vo.setTargetType(comment.getTargetType());
                    if (comment.getCreateTime() != null) {
                        vo.setCreateTime(comment.getCreateTime().toString());
                    }
                    return vo;
                })
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), size, page);
    }
}

