package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.ArticleTagMapper;
import com.blog.mapper.CommentMapper;
import com.blog.mapper.TalkMapper;
import com.blog.model.document.CommentDocument;
import com.blog.model.document.MomentDocument;
import com.blog.model.document.PostDocument;
import com.blog.model.entity.Article;
import com.blog.model.entity.Comment;
import com.blog.model.entity.Talk;
import com.blog.repository.CommentDocumentRepository;
import com.blog.repository.MomentDocumentRepository;
import com.blog.repository.PostDocumentRepository;
import com.blog.service.SearchSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchSyncServiceImpl implements SearchSyncService {
    @Autowired
    private PostDocumentRepository postDocumentRepository;

    @Autowired
    private MomentDocumentRepository momentDocumentRepository;

    @Autowired
    private CommentDocumentRepository commentDocumentRepository;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Override
    @Transactional
    public void syncPost(Long articleId) {
        Article article = articleMapper.selectById(articleId);
        if (article == null) {
            return;
        }

        if (article.getStatus() != null && article.getStatus() == 1) {
            PostDocument doc = convertToPostDocument(article);
            postDocumentRepository.save(doc);
        } else {
            postDocumentRepository.deleteById(articleId);
        }
    }

    @Override
    @Transactional
    public void syncMoment(Long talkId) {
        Talk talk = talkMapper.selectById(talkId);
        if (talk == null) {
            return;
        }

        if ("1".equals(talk.getStatus())) {
            MomentDocument doc = convertToMomentDocument(talk);
            momentDocumentRepository.save(doc);
        } else {
            momentDocumentRepository.deleteById(talkId);
        }
    }

    @Override
    @Transactional
    public void syncComment(Long commentId) {
        Comment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            return;
        }

        if (comment.getStatus() != null && comment.getStatus() == 1) {
            CommentDocument doc = convertToCommentDocument(comment);
            commentDocumentRepository.save(doc);
        } else {
            commentDocumentRepository.deleteById(commentId);
        }
    }

    @Override
    @Transactional
    public void deletePost(Long articleId) {
        postDocumentRepository.deleteById(articleId);
    }

    @Override
    @Transactional
    public void deleteMoment(Long talkId) {
        momentDocumentRepository.deleteById(talkId);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        commentDocumentRepository.deleteById(commentId);
    }

    @Override
    @Transactional
    public void syncAllPosts() {
        List<Article> articles = articleMapper.selectList(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getStatus, 1)
        );

        List<PostDocument> documents = articles.stream()
                .map(this::convertToPostDocument)
                .collect(Collectors.toList());

        postDocumentRepository.saveAll(documents);
    }

    @Override
    @Transactional
    public void syncAllMoments() {
        List<Talk> talks = talkMapper.selectList(
                new LambdaQueryWrapper<Talk>()
                        .eq(Talk::getStatus, "1")
        );

        List<MomentDocument> documents = talks.stream()
                .map(this::convertToMomentDocument)
                .collect(Collectors.toList());

        momentDocumentRepository.saveAll(documents);
    }

    @Override
    @Transactional
    public void syncAllComments() {
        List<Comment> comments = commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getStatus, 1)
        );

        List<CommentDocument> documents = comments.stream()
                .map(this::convertToCommentDocument)
                .collect(Collectors.toList());

        commentDocumentRepository.saveAll(documents);
    }

    private PostDocument convertToPostDocument(Article article) {
        PostDocument doc = new PostDocument();
        doc.setId(article.getId());
        doc.setTitle(article.getTitle());
        doc.setContent(article.getContent());
        doc.setExcerpt(article.getExcerpt());
        doc.setAuthorId(article.getAuthorId());
        doc.setCategoryId(article.getCategoryId());
        doc.setStatus(article.getStatus());
        doc.setPublishedAt(article.getPublishedAt());
        doc.setViewCount(article.getViewCount());
        doc.setLikeCount(article.getLikeCount());
        doc.setCommentCount(article.getCommentCount());
        doc.setIsTop(article.getIsTop() != null && article.getIsTop() == 1);
        doc.setCreateTime(article.getCreateTime());

        List<Long> tagIds = articleTagMapper.selectTagIdsByArticleId(article.getId());
        doc.setTagIds(tagIds);

        return doc;
    }

    private MomentDocument convertToMomentDocument(Talk talk) {
        MomentDocument doc = new MomentDocument();
        doc.setId(talk.getId());
        doc.setContent(talk.getContent());
        doc.setAuthorId(talk.getAuthorId());
        doc.setLikeCount(talk.getLikeCount());
        doc.setCommentCount(talk.getCommentCount());
        doc.setCreateTime(talk.getCreateTime());
        return doc;
    }

    private CommentDocument convertToCommentDocument(Comment comment) {
        CommentDocument doc = new CommentDocument();
        doc.setId(comment.getId());
        doc.setContent(comment.getContent());
        doc.setTargetId(comment.getTargetId());
        doc.setTargetType(comment.getTargetType());
        doc.setUserId(comment.getUserId());
        doc.setParentId(comment.getParentId());
        doc.setStatus(comment.getStatus());
        doc.setCreateTime(comment.getCreateTime());
        return doc;
    }
}

