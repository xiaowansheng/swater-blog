package com.blog.service;

public interface SearchSyncService {
    void syncPost(Long articleId);

    void syncMoment(Long talkId);

    void syncComment(Long commentId);

    void deletePost(Long articleId);

    void deleteMoment(Long talkId);

    void deleteComment(Long commentId);

    void syncAllPosts();

    void syncAllMoments();

    void syncAllComments();
}

