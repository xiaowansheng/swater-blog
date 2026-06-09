package com.blog.modules.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.blog.modules.article.mapper.ArticleDirectoryMapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.DirectoryNodeMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleDirectory;
import com.blog.modules.article.model.entity.DirectoryNode;
import com.blog.modules.article.model.vo.ArticleDirectoryItemVO;
import com.blog.modules.article.service.ArticleCommandService;
import com.blog.modules.category.mapper.CategoryMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ArticleDirectoryServiceImplTest {

    private DirectoryNodeMapper nodeMapper;
    private ArticleDirectoryMapper directoryArticleMapper;
    private ArticleMapper articleMapper;
    private CategoryMapper categoryMapper;
    private ArticleDirectoryServiceImpl service;

    @BeforeEach
    void setUp() {
        initMybatisPlusTableInfo();

        nodeMapper = mock(DirectoryNodeMapper.class);
        directoryArticleMapper = mock(ArticleDirectoryMapper.class);
        articleMapper = mock(ArticleMapper.class);
        categoryMapper = mock(CategoryMapper.class);

        service = new ArticleDirectoryServiceImpl();
        ReflectionTestUtils.setField(service, "nodeMapper", nodeMapper);
        ReflectionTestUtils.setField(service, "directoryArticleMapper", directoryArticleMapper);
        ReflectionTestUtils.setField(service, "articleMapper", articleMapper);
        ReflectionTestUtils.setField(service, "categoryMapper", categoryMapper);
        ReflectionTestUtils.setField(service, "articleCommandService", mock(ArticleCommandService.class));
    }

    private static void initMybatisPlusTableInfo() {
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(new MybatisConfiguration(), "test");
        assistant.setCurrentNamespace("test");
        TableInfoHelper.initTableInfo(assistant, Article.class);
        TableInfoHelper.initTableInfo(assistant, ArticleDirectory.class);
        TableInfoHelper.initTableInfo(assistant, DirectoryNode.class);
    }

    @Test
    void tree_attachesArticlesWithoutDirectoryPlacementToRoot() {
        Article article = new Article();
        article.setId(10L);
        article.setTitle("Unassigned article");

        ArgumentCaptor<ArticleDirectory> placementCaptor = ArgumentCaptor.forClass(ArticleDirectory.class);

        when(articleMapper.selectList(any(Wrapper.class))).thenReturn(List.of(article));
        when(directoryArticleMapper.selectList(any(Wrapper.class)))
                .thenReturn(List.of())
                .thenReturn(List.of(rootPlacement(10L)));
        when(directoryArticleMapper.selectMaxSortByNodeId(0L)).thenReturn(0);
        when(nodeMapper.selectMaxSortByParentId(0L)).thenReturn(0);
        when(nodeMapper.selectList(any(Wrapper.class))).thenReturn(List.of());
        when(articleMapper.selectBatchIds(List.of(10L))).thenReturn(List.of(article));

        List<ArticleDirectoryItemVO> tree = service.tree();

        org.mockito.Mockito.verify(directoryArticleMapper).insert(placementCaptor.capture());
        ArticleDirectory inserted = placementCaptor.getValue();
        assertThat(inserted.getArticleId()).isEqualTo(10L);
        assertThat(inserted.getNodeId()).isZero();
        assertThat(inserted.getSort()).isEqualTo(10);

        assertThat(tree).hasSize(1);
        ArticleDirectoryItemVO rootArticle = tree.get(0);
        assertThat(rootArticle.getType()).isEqualTo("ARTICLE");
        assertThat(rootArticle.getArticleId()).isEqualTo(10L);
        assertThat(rootArticle.getParentId()).isZero();
        assertThat(rootArticle.getTitle()).isEqualTo("Unassigned article");
    }

    private static ArticleDirectory rootPlacement(Long articleId) {
        ArticleDirectory placement = new ArticleDirectory();
        placement.setId(1L);
        placement.setArticleId(articleId);
        placement.setNodeId(0L);
        placement.setSort(10);
        return placement;
    }
}
