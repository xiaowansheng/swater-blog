package com.blog.service;

import com.blog.model.dto.ArticleDTO;
import java.util.List;

public interface ArticleAdminCommandService {
    Long create(ArticleDTO dto);

    void update(Long id, ArticleDTO dto);

    void delete(Long id);

    void deleteBatch(List<Long> ids);

    void publish(Long id);

    void unpublish(Long id);
}

