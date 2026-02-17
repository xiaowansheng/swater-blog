package com.blog.modules.article.service;


import com.blog.modules.article.model.dto.ArticleDTO;
import java.util.List;
public interface ArticleCommandService {
    Long create(ArticleDTO dto);

    void update(Long id, ArticleDTO dto);

    void delete(Long id);

    void deleteBatch(List<Long> ids);

    void publish(Long id);

    void unpublish(Long id);

    void updateMeta(Long id, com.blog.modules.article.model.dto.ArticleMetaDTO dto);
}

