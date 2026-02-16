package com.blog.modules.category.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.category.mapper.CategoryMapper;
import com.blog.modules.category.model.dto.CategoryDTO;
import com.blog.modules.category.model.entity.Category;
import com.blog.modules.category.model.enums.CategoryStatus;
import com.blog.modules.category.model.vo.CategoryVO;
import com.blog.modules.category.service.CategoryService;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.KeyUtil;
import com.blog.infrastructure.revalidate.RevalidateClient;
import com.blog.infrastructure.revalidate.RevalidateTags;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired(required = false)
    private RevalidateClient revalidateClient;

    @Override
    @Cacheable(value = "category:list", key = "'all'", unless = "#result == null")
    public List<CategoryVO> list() {
        List<Category> categories = categoryMapper.selectListWithArticleCount();
        return buildTree(BeanUtil.copyList(categories, CategoryVO.class));
    }

    @Override
    @Cacheable(value = "category:list", key = "'public'", unless = "#result == null")
    public List<CategoryVO> listPublic() {
        List<Category> categories = categoryMapper.selectPublicListWithArticleCount();
        return buildTree(BeanUtil.copyList(categories, CategoryVO.class));
    }

    @Override
    @Cacheable(value = "category", key = "'id:' + #id", unless = "#result == null")
    public CategoryVO getById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            return null;
        }
        return BeanUtil.copyProperties(category, CategoryVO.class);
    }

    @Override
    @Cacheable(value = "category", key = "'key:' + #key", unless = "#result == null")
    public CategoryVO getByKey(String key) {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getCategoryKey, key);
        Category category = categoryMapper.selectOne(wrapper);
        if (category == null) {
            return null;
        }
        return BeanUtil.copyProperties(category, CategoryVO.class);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "category:list", allEntries = true),
            @CacheEvict(value = "category", allEntries = true)
    })
    public Long create(CategoryDTO dto) {
        Category category = BeanUtil.copyProperties(dto, Category.class);
        category.setCategoryKey(KeyUtil.generateKey("category"));
        if (dto.getStatus() == null) {
            category.setStatus(CategoryStatus.PUBLISHED.getCode());
        }
        if (dto.getParentId() == null) {
            category.setParentId(0L);
        }
        if (dto.getSort() == null) {
            category.setSort(0);
        }
        categoryMapper.insert(category);
        triggerRevalidate(category);
        return category.getId();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "category:list", allEntries = true),
            @CacheEvict(value = "category", allEntries = true)
    })
    public void update(Long id, CategoryDTO dto) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        category.setParentId(dto.getParentId());
        category.setSort(dto.getSort());
        category.setStatus(dto.getStatus());
        categoryMapper.updateById(category);
        triggerRevalidate(category);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "category:list", allEntries = true),
            @CacheEvict(value = "category", allEntries = true)
    })
    public void delete(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        Long count = articleMapper.selectCount(new LambdaQueryWrapper<Article>()
                .eq(Article::getCategoryId, id)
                .eq(Article::getDeleted, 0));
        if (count > 0) {
            throw new BusinessException("该分类下有文章，禁止删除");
        }

        categoryMapper.deleteById(id);
        triggerRevalidate(category);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "category:list", allEntries = true),
            @CacheEvict(value = "category", allEntries = true)
    })
    public Long findOrCreateByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getName, name.trim());
        Category category = categoryMapper.selectOne(wrapper);
        if (category != null) {
            return category.getId();
        }
        
        CategoryDTO dto = new CategoryDTO();
        dto.setName(name.trim());
        dto.setSlug(name.trim().toLowerCase().replaceAll("\\s+", "-"));
        return create(dto);
    }

    private void triggerRevalidate(Category category) {
        if (revalidateClient == null) {
            return;
        }
        EventUtil.publishEventAfterCommit(() -> {
            List<String> tags = new ArrayList<>(RevalidateTags.CATEGORY_LIST);
            if (category != null) {
                if (category.getId() != null) {
                    tags.add("category:detail:id:" + category.getId());
                }
                if (category.getCategoryKey() != null && !category.getCategoryKey().isBlank()) {
                    tags.add("category:detail:key:" + category.getCategoryKey());
                }
            }
            revalidateClient.revalidateTags(tags);
        });
    }

    private List<CategoryVO> buildTree(List<CategoryVO> categories) {
        List<CategoryVO> rootCategories = categories.stream()
                .filter(c -> c.getParentId() == null || c.getParentId() == 0)
                .collect(Collectors.toList());
        
        for (CategoryVO root : rootCategories) {
            buildChildren(root, categories);
        }
        
        return rootCategories;
    }

    private void buildChildren(CategoryVO parent, List<CategoryVO> all) {
        List<CategoryVO> children = all.stream()
                .filter(c -> parent.getId().equals(c.getParentId()))
                .collect(Collectors.toList());
        parent.setChildren(children);
        for (CategoryVO child : children) {
            buildChildren(child, all);
        }
    }
}

