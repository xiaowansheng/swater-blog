package com.blog.controller.admin;

import com.blog.BaseWebTest;
import com.blog.TestDataFactory;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CategoryMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.dto.ArticleCreateDTO;
import com.blog.model.dto.ArticleUpdateDTO;
import com.blog.model.entity.Article;
import com.blog.model.entity.Category;
import com.blog.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 文章管理控制器测试
 */
@DisplayName("文章管理控制器测试")
class ArticleAdminControllerTest extends BaseWebTest {
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private CategoryMapper categoryMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private TestDataFactory testDataFactory;
    
    private User testUser;
    private Category testCategory;
    private String authToken = "test-token"; // 模拟认证token
    
    @BeforeEach
    void setUp() {
        super.setUp();
        
        // 创建测试用户
        testUser = testDataFactory.createAdminUser();
        userMapper.insert(testUser);
        
        // 创建测试分类
        testCategory = testDataFactory.createCategory();
        categoryMapper.insert(testCategory);
    }
    
    @Test
    @DisplayName("获取文章列表 - 成功")
    void getArticleList_Success() throws Exception {
        // Given
        Article article1 = testDataFactory.createArticle();
        article1.setAuthorId(testUser.getId());
        article1.setCategoryId(testCategory.getId());
        articleMapper.insert(article1);
        
        Article article2 = testDataFactory.createDraftArticle();
        article2.setAuthorId(testUser.getId());
        article2.setCategoryId(testCategory.getId());
        articleMapper.insert(article2);
        
        // When & Then
        mockMvc.perform(get("/api/admin/post/list")
                .header("Authorization", authToken)
                .param("current", "1")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$.data.total", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data.records[0].title").exists())
                .andExpect(jsonPath("$.data.records[0].status").exists());
    }
    
    @Test
    @DisplayName("根据ID获取文章 - 成功")
    void getArticleById_Success() throws Exception {
        // Given
        Article article = testDataFactory.createArticle();
        article.setAuthorId(testUser.getId());
        article.setCategoryId(testCategory.getId());
        articleMapper.insert(article);
        
        // When & Then
        mockMvc.perform(get("/api/admin/post/{id}", article.getId())
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(article.getId()))
                .andExpect(jsonPath("$.data.title").value(article.getTitle()))
                .andExpect(jsonPath("$.data.content").value(article.getContent()));
    }
    
    @Test
    @DisplayName("创建文章 - 成功")
    void createArticle_Success() throws Exception {
        // Given
        ArticleCreateDTO createDTO = new ArticleCreateDTO();
        createDTO.setTitle("测试文章标题");
        createDTO.setContent("这是一篇测试文章的内容");
        createDTO.setExcerpt("文章摘要");
        createDTO.setCategoryId(testCategory.getId());
        createDTO.setType("original");
        createDTO.setStatus("draft");
        createDTO.setTagIds(Arrays.asList(1L, 2L));
        
        // When & Then
        mockMvc.perform(post("/api/admin/post")
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(createDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isNumber())
                .andExpect(jsonPath("$.message").value("success"));
    }
    
    @Test
    @DisplayName("创建文章 - 标题为空应该失败")
    void createArticle_EmptyTitle_ShouldFail() throws Exception {
        // Given
        ArticleCreateDTO createDTO = new ArticleCreateDTO();
        createDTO.setTitle(""); // 空标题
        createDTO.setContent("测试内容");
        createDTO.setCategoryId(testCategory.getId());
        
        // When & Then
        mockMvc.perform(post("/api/admin/post")
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(createDTO)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }
    
    @Test
    @DisplayName("更新文章 - 成功")
    void updateArticle_Success() throws Exception {
        // Given
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
        
        // When & Then
        mockMvc.perform(put("/api/admin/post/{id}", article.getId())
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(updateDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("success"));
    }
    
    @Test
    @DisplayName("删除文章 - 成功")
    void deleteArticle_Success() throws Exception {
        // Given
        Article article = testDataFactory.createArticle();
        article.setAuthorId(testUser.getId());
        article.setCategoryId(testCategory.getId());
        articleMapper.insert(article);
        
        // When & Then
        mockMvc.perform(delete("/api/admin/post/{id}", article.getId())
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("success"));
    }
    
    @Test
    @DisplayName("发布文章 - 成功")
    void publishArticle_Success() throws Exception {
        // Given
        Article article = testDataFactory.createDraftArticle();
        article.setAuthorId(testUser.getId());
        article.setCategoryId(testCategory.getId());
        articleMapper.insert(article);
        
        // When & Then
        mockMvc.perform(post("/api/admin/post/{id}/publish", article.getId())
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("success"));
    }
    
    @Test
    @DisplayName("批量删除文章 - 成功")
    void batchDeleteArticles_Success() throws Exception {
        // Given
        Article article1 = testDataFactory.createArticle();
        article1.setAuthorId(testUser.getId());
        article1.setCategoryId(testCategory.getId());
        articleMapper.insert(article1);
        
        Article article2 = testDataFactory.createArticle();
        article2.setAuthorId(testUser.getId());
        article2.setCategoryId(testCategory.getId());
        articleMapper.insert(article2);
        
        // When & Then
        mockMvc.perform(delete("/api/admin/post/batch")
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Arrays.asList(article1.getId(), article2.getId()))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("success"));
    }
    
    @Test
    @DisplayName("获取文章统计信息 - 成功")
    void getArticleStatistics_Success() throws Exception {
        // Given
        Article publishedArticle = testDataFactory.createArticle();
        publishedArticle.setAuthorId(testUser.getId());
        publishedArticle.setCategoryId(testCategory.getId());
        articleMapper.insert(publishedArticle);
        
        Article draftArticle = testDataFactory.createDraftArticle();
        draftArticle.setAuthorId(testUser.getId());
        draftArticle.setCategoryId(testCategory.getId());
        articleMapper.insert(draftArticle);
        
        // When & Then
        mockMvc.perform(get("/api/admin/post/statistics")
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalCount").isNumber())
                .andExpect(jsonPath("$.data.publishedCount").isNumber())
                .andExpect(jsonPath("$.data.draftCount").isNumber());
    }
}