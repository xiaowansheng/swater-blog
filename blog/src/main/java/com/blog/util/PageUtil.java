package com.blog.util;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.model.dto.BaseDTO;
import java.util.List;

public class PageUtil {
    public static <T> Page<T> buildPage(Long current, Long size) {
        return new Page<>(current != null ? current : 1, size != null ? size : 10);
    }

    public static <T> Page<T> buildPage(BaseDTO dto) {
        Long current = dto.getCurrent();
        Long size = dto.getSize();
        return buildPage(current, size);
    }

    public static <T> PageResult<T> buildResult(IPage<T> page) {
        return new PageResult<>(page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent());
    }

    public static <T> PageResult<T> buildPageResult(IPage<?> page, List<T> records) {
        return new PageResult<>(records, page.getTotal(), page.getSize(), page.getCurrent());
    }
}

