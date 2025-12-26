package com.blog.service.impl;

import com.blog.BaseTest;
import com.blog.TestDataFactory;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CategoryMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.dto.ArticleCreateDTO;
import com.blog.model.dto.ArticleUpdateDTO;
import com.blog.model.entity.Article;
import com.blog.model.entity.Category;
import com.blog.model.entity.User;
import com.blog.service.ArticleAdminCommandService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 文章管理命令服务测试
 */
@DisplayName("文章管理命令服务测试")
class ArticleAdminCommandServiceTest extends BaseTest {
    
    @Autowired
    private ArticleAdminCommandService articleAdminCommandService;
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private CategoryMapper categoryMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private TestDataFactory testDataFactory;
    
    @MockBean
    private ApplicationEventPublisher eventPublisher;
    
    private User testUser;
    private Category testCategory;
    
    @BeforeEach
    void setUp() {
        // 创建测试用户
        testUser = testDataFactory.createAdminUser();
        userMapper.insert(testUser);
        
        // 创建测试分类
        testCategory = testDataFactory.createCategory();
        categoryMapper.insert(testCategory);
    }
    
    @Test
    @DisplayName("创建文章 - 成功")
    void createArticle_Success() {
        // Given
        ArticleCreateDTO createDTO = new ArticleCreateDTO();
        createDTO.setTitle("测试文章标题");
        createDTO.setContent("这是一篇测试文章的内容");
        createDTO.setExcerpt("文章摘要");
        createDTO.setCategoryId(testCategory.getId());
        createDTO.setType("original");
        createDTO.setStatus("draft");
        createDTO.setTagIds(Arrays.asList(1L, 2L));
        
        // When
        Long articleId = articleAdminCommandService.createArticle(createDTO, testUser.getId());
        
        // Then
        assertThat(articleId).isNotNull();
        
        Article savedArticle = articleMapper.selectById(articleId);
        assertThat(savedArticle).isNotNull();
        assertThat(savedArticle.getTitle()).isEqualTo("测试文章标题");
        assertThat(savedArticle.getContent()).isEqualTo("这是一篇测试文章的内容");
        assertThat(savedArticle.getCategoryId()).isEqualTo(testCategory.getId());
        assertThat(savedArticle.getAuthorId()).isEqualTo(testUser.getId());
        assertThat(savedArticle.getStatus()).isEqualTo("draft");
        assertThat(savedArticle.getSlug()).isNotNull();
        
        // 验证事件发布
        verify(eventPublisher, times(1)).publishEvent(any());
    }
    
    @Test
    @DisplayName("创建文章 - 标题为空应该失败")
    void createArticle_EmptyTitle_ShouldFail() {
        // Given
        ArticleCreateDTO createDTO = new ArticleCreateDTO();
        createDTO.setTitle(""); // 空标题
        createDTO.setContent("测试内容");
        createDTO.setCategoryId(testCategory.getId());
        
        // When & Then
        assertThatThrownBy(() -> 
            articleAdminCommandService.createArticle(createDTO, testUser.getId())
        ).isInstanceOf(IllegalArgumentException.class)
         .hasMessageContaining("标题不能为空");
    }
    
    @Test
    @DisplayName("更新文章 - 成功")
    void updateArticle_Success() {
        // Given - 先创建一篇文章
        Article article = testDataFactory.createDraftArticle();
        article.setAuthorId(testUser.getId());
        article.setCategoryId(testCategory.getId());
        articleMapper.insert(article);
        
        ArticleUpdateDTO updateDTO = new ArticleUpdateDTO();
        updateDTO.setTitle("更新后的标题");
        updateDTO.setContent("更新后的内容");
        updateDTO.setExcerpt("更新后的摘要");
        updateDTO.setCategoryId(testCategory.getId());
        updateDTO.setStatus("published");
        
        // When
        articleAdminCommandService.updateArticle(article.getId(), updateDTO, testUser.getId());
        
        // Then
        Article updatedArticle = articleMapper.selectById(article.getId());
        assertThat(updatedArticle.getTitle()).isEqualTo("更新后的标题");
        assertThat(updatedArticle.getContent()).isEqualTo("更新后的内容");
        assertThat(updatedArticle.getStatus()).isEqualTo("published");
        assertThat(updatedArticle.getPublishedAt()).isNotNull();
        
        // 验证事件发布
        verify(eventPublisher, atLeastOnce()).publishEvent(any());
    }
    
    @Test
    @DisplayName("删除文章 - 成功")
    void deleteArticle_Success() {
        // Given
        Article article = testDataFactory.createArticle();
        article.setAuthorId(testUser.getId());
        article.setCategoryId(testCategory.getId());
        articleMapper.insert(article);
        
        // When
        articleAdminCommandService.deleteArticle(article.getId(), testUser.getId());
        
        // Then
        Article deletedArticle = articleMapper.selectById(article.getId());
        assertThat(deletedArticle.getDeleted()).isEqualTo(1);
        
        // 验证事件发布
        verify(eventPublisher, times(1)).publishEvent(any());
    }
    
    @Test
    @DisplayName("发布文章 - 成功")
    void publishArticle_Success() {
        // Given
        Article article = testDataFactory.createDraftArticle();
        article.setAuthorId(testUser.getId());
        article.setCategoryId(testCategory.getId());
        articleMapper.insert(article);
        
        // When
        articleAdminCommandService.publishArticle(article.getId(), testUser.getId());
        
        // Then
        Article publishedArticle = articleMapper.selectById(article.getId());
        assertThat(publishedArticle.getStatus()).isEqualTo("published");
        assertThat(publishedArticle.getPublishedAt()).isNotNull();
        assertThat(publishedArticle.getPublishedAt()).isBefore(LocalDateTime.now().plusSeconds(1));
        
        // 验证事件发布
        verify(eventPublisher, times(1)).publishEvent(any());
    }
    
    @Test
    @DisplayName("取消发布文章 - 成功")
    void unpublishArticle_Success() {
        // Given
        Article article = testDataFactory.createArticle(); // 已发布的文章
        article.setAuthorId(testUser.getId());
        article.setCategoryId(testCategory.getId());
        articleMapper.insert(article);
        
        // When
        articleAdminCommandService.unpublishArticle(article.getId(), testUser.getId());
        
        // Then
        Article unpublishedArticle = articleMapper.selectById(article.getId());
        assertThat(unpublishedArticle.getStatus()).isEqualTo("draft");
        
        // 验证事件发布
        verify(eventPublisher, times(1)).publishEvent(any());
    }
    
    @Test
    @DisplayName("批量删除文章 - 成功")
    void batchDeleteArticles_Success() {
        // Given
        Article article1 = testDataFactory.createArticle();
        article1.setAuthorId(testUser.getId());
        article1.setCategoryId(testCategory.getId());
        articleMapper.insert(article1);
        
        Article article2 = testDataFactory.createArticle();
        article2.setAuthorId(testUser.getId());
        article2.setCategoryId(testCategory.getId());
        articleMapper.insert(article2);
        
        // When
        articleAdminCommandService.batchDeleteArticles(
            Arrays.asList(article1.getId(), article2.getId()), 
            testUser.getId()
        );
        
        // Then
        Article deletedArticle1 = articleMapper.selectById(article1.getId());
        Article deletedArticle2 = articleMapper.selectById(article2.getId());
        
        assertThat(deletedArticle1.getDeleted()).isEqualTo(1);
        assertThat(deletedArticle2.getDeleted()).isEqualTo(1);
        
        // 验证事件发布
        verify(eventPublisher, times(2)).publishEvent(any());
    }
}