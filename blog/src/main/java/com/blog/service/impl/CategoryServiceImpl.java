package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.CategoryMapper;
import com.blog.model.dto.CategoryDTO;
import com.blog.model.entity.Category;
import com.blog.model.vo.CategoryVO;
import com.blog.service.CategoryService;
import com.blog.util.BeanUtil;
import com.blog.util.KeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public List<CategoryVO> list() {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getDeleted, 0);
        wrapper.orderByAsc(Category::getSort);
        List<Category> categories = categoryMapper.selectList(wrapper);
        return buildTree(BeanUtil.copyList(categories, CategoryVO.class));
    }

    @Override
    public List<CategoryVO> listPublic() {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Category::getDeleted, 0);
        wrapper.eq(Category::getStatus, "1");
        wrapper.orderByAsc(Category::getSort);
        List<Category> categories = categoryMapper.selectList(wrapper);
        return buildTree(BeanUtil.copyList(categories, CategoryVO.class));
    }

    @Override
    public CategoryVO getById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null || category.getDeleted() == 1) {
            return null;
        }
        return BeanUtil.copyProperties(category, CategoryVO.class);
    }

    @Override
    @Transactional
    public Long create(CategoryDTO dto) {
        Category category = BeanUtil.copyProperties(dto, Category.class);
        category.setCategoryKey(KeyUtil.generateKey("category"));
        if (dto.getStatus() == null) {
            category.setStatus("1");
        }
        if (dto.getParentId() == null) {
            category.setParentId(0L);
        }
        if (dto.getSort() == null) {
            category.setSort(0);
        }
        categoryMapper.insert(category);
        return category.getId();
    }

    @Override
    @Transactional
    public void update(Long id, CategoryDTO dto) {
        Category category = categoryMapper.selectById(id);
        if (category == null || category.getDeleted() == 1) {
            throw new BusinessException("分类不存在");
        }
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        category.setParentId(dto.getParentId());
        category.setSort(dto.getSort());
        category.setStatus(dto.getStatus());
        categoryMapper.updateById(category);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null || category.getDeleted() == 1) {
            throw new BusinessException("分类不存在");
        }
        categoryMapper.deleteById(id);
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

