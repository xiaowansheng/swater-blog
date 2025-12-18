package com.blog.util;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import java.util.List;

public class PageUtil {
    public static <T> Page<T> buildPage(Long current, Long size) {
        return new Page<>(current != null ? current : 1, size != null ? size : 10);
    }

    public static <T> PageResult<T> buildResult(IPage<T> page) {
        return new PageResult<>(page.getRecords(), page.getTotal(), page.getSize(), page.getCurrent());
    }
}

