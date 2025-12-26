package com.blog;

import com.blog.model.entity.Article;
import com.blog.model.entity.Category;
import com.blog.model.entity.Comment;
import com.blog.model.entity.User;
import net.datafaker.Faker;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Locale;

/**
 * 测试数据工厂
 * 使用Faker生成测试数据
 */
@Component
public class TestDataFactory {
    
    private final Faker faker = new Faker(Locale.CHINA);
    
    /**
     * 创建测试用户
     */
    public User createUser() {
        User user = new User();
        user.setUsername(faker.internet().emailAddress());
        user.setEmail(faker.internet().emailAddress());
        user.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa"); // 123456
        user.setNickname(faker.name().fullName());
        user.setAvatar(faker.internet().avatar());
        user.setPhone(faker.phoneNumber().cellPhone());
        user.setSignature(faker.lorem().sentence());
        user.setWebsite(faker.internet().url());
        user.setIntroduction(faker.lorem().paragraph());
        user.setRole("user");
        user.setStatus(1);
        user.setDisabled(0);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        return user;
    }
    
    /**
     * 创建管理员用户
     */
    public User createAdminUser() {
        User user = createUser();
        user.setRole("admin");
        user.setUsername("admin@test.com");
        user.setEmail("admin@test.com");
        user.setNickname("管理员");
        return user;
    }
    
    /**
     * 创建测试分类
     */
    public Category createCategory() {
        Category category = new Category();
        category.setName(faker.book().genre());
        category.setSlug(faker.internet().slug());
        category.setDescription(faker.lorem().sentence());
        category.setCover(faker.internet().image());
        category.setSort(faker.number().numberBetween(1, 100));
        category.setStatus(1);
        category.setCreateTime(LocalDateTime.now());
        category.setUpdateTime(LocalDateTime.now());
        return category;
    }
    
    /**
     * 创建测试文章
     */
    public Article createArticle() {
        Article article = new Article();
        article.setTitle(faker.book().title());
        article.setSlug(faker.internet().slug());
        article.setContent(faker.lorem().paragraphs(5).toString());
        article.setExcerpt(faker.lorem().sentence());
        article.setCover(faker.internet().image());
        article.setType("original");
        article.setStatus("published");
        article.setIsTop(0);
        article.setViewCount(faker.number().numberBetween(0, 1000));
        article.setLikeCount(faker.number().numberBetween(0, 100));
        article.setCommentCount(faker.number().numberBetween(0, 50));
        article.setPublishedAt(LocalDateTime.now());
        article.setCreateTime(LocalDateTime.now());
        article.setUpdateTime(LocalDateTime.now());
        return article;
    }
    
    /**
     * 创建草稿文章
     */
    public Article createDraftArticle() {
        Article article = createArticle();
        article.setStatus("draft");
        article.setPublishedAt(null);
        return article;
    }
    
    /**
     * 创建测试评论
     */
    public Comment createComment() {
        Comment comment = new Comment();
        comment.setContent(faker.lorem().sentence());
        comment.setType("article");
        comment.setNickname(faker.name().fullName());
        comment.setEmail(faker.internet().emailAddress());
        comment.setStatus("approved");
        comment.setIsVisible(1);
        comment.setIp(faker.internet().ipV4Address());
        comment.setIpAddress(faker.address().city());
        comment.setCountry("中国");
        comment.setProvince(faker.address().state());
        comment.setCity(faker.address().city());
        comment.setDevice(faker.options().option("PC", "Mobile", "Tablet"));
        comment.setBrowser(faker.options().option("Chrome", "Firefox", "Safari", "Edge"));
        comment.setCreateTime(LocalDateTime.now());
        comment.setUpdateTime(LocalDateTime.now());
        return comment;
    }
    
    /**
     * 创建回复评论
     */
    public Comment createReplyComment(Long parentId, Long rootId) {
        Comment comment = createComment();
        comment.setParentId(parentId);
        comment.setRootId(rootId);
        return comment;
    }
}