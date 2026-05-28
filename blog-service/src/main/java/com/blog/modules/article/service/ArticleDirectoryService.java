package com.blog.modules.article.service;

import com.blog.modules.article.model.dto.ArticleDirectoryAssignArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryCreateArticleDTO;
import com.blog.modules.article.model.dto.ArticleDirectoryMoveDTO;
import com.blog.modules.article.model.dto.DirectoryNodeDTO;
import com.blog.modules.article.model.vo.ArticleDirectoryItemVO;

import java.util.List;

public interface ArticleDirectoryService {
    List<ArticleDirectoryItemVO> tree();

    Long createNode(DirectoryNodeDTO dto);

    void updateNode(Long id, DirectoryNodeDTO dto);

    void deleteNode(Long id);

    void move(ArticleDirectoryMoveDTO dto);

    void assignArticle(ArticleDirectoryAssignArticleDTO dto);

    Long createArticle(ArticleDirectoryCreateArticleDTO dto);
}
