package com.blog.shared.util;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.shared.model.dto.BaseDTO;
import java.util.List;
public class PageUtil {
    private static final long MAX_PAGE = 100;
    private static final long MAX_SIZE = 100;

    public static <T> Page<T> buildPage(Long current, Long size) {
        Long page = current != null ? current : 1;
        Long pageSize = size != null ? size : 10;

        // 限制最大页数和每页大小
        if (page > MAX_PAGE) {
            page = MAX_PAGE;
        }
        if (page < 1) {
            page = 1L;
        }
        if (pageSize > MAX_SIZE) {
            pageSize = MAX_SIZE;
        }
        if (pageSize < 1) {
            pageSize = 10L;
        }

        return new Page<>(page, pageSize);
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

