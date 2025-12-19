package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.mapper.PageViewMapper;
import com.blog.model.entity.PageView;
import com.blog.model.vo.PageViewVO;
import com.blog.service.PageViewService;
import com.blog.util.BeanUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PageViewServiceImpl implements PageViewService {
    @Autowired
    private PageViewMapper pageViewMapper;

    @Override
    @Transactional
    public void incrementView(String viewType, Long viewId) {
        PageView pageView = pageViewMapper.selectByTypeAndId(viewType, viewId);
        if (pageView == null) {
            pageView = new PageView();
            pageView.setViewType(viewType);
            pageView.setViewId(viewId);
            pageView.setCount(1L);
            pageViewMapper.insert(pageView);
        } else {
            pageViewMapper.incrementCount(viewType, viewId);
        }
    }

    @Override
    public PageViewVO getViewCount(String viewType, Long viewId) {
        PageView pageView = pageViewMapper.selectByTypeAndId(viewType, viewId);
        if (pageView == null) {
            PageViewVO vo = new PageViewVO();
            vo.setViewType(viewType);
            vo.setViewId(viewId);
            vo.setCount(0L);
            return vo;
        }
        return BeanUtil.copyProperties(pageView, PageViewVO.class);
    }

    @Override
    public Long getTotalViewCount(String viewType) {
        LambdaQueryWrapper<PageView> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PageView::getViewType, viewType)
                .eq(PageView::getDeleted, 0);
        List<PageView> list = pageViewMapper.selectList(wrapper);
        return list.stream()
                .mapToLong(pv -> pv.getCount() != null ? pv.getCount() : 0L)
                .sum();
    }
}

