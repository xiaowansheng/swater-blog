package com.blog.modules.article.service;

import com.blog.modules.article.model.dto.ArticleDirectoryAssignArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryCreateArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryMoveDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryNodeDTO;
import com.blog.modules.article.model.vo.ArticleDirectoryItemVO;

import java.util.List;

public interface ArticleDirectoryService {
    List<ArticleDirectoryItemVO> tree();

    Long createNode(ArticleDirectoryNodeDTO dto);

    void updateNode(Long id, ArticleDirectoryNodeDTO dto);

    void deleteNode(Long id);

    void move(ArticleDirectoryMoveDTO dto);

    void assignArticle(ArticleDirectoryAssignArticleDTO dto);

    Long createArticle(ArticleDirectoryCreateArticleDTO dto);
}
