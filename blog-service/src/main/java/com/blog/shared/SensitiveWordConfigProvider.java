package com.blog.shared;

import java.util.List;

/**
 * 自定义敏感词配置提供者（SPI）。
 * <p>shared 层不直接依赖业务模块：由 system/config 模块提供实现，
 * 把数据库里配置的自定义敏感词喂给 {@link SensitiveWordHelper}。</p>
 */
public interface SensitiveWordConfigProvider {

    /**
     * @return 当前生效的自定义敏感词列表（不可变），无配置时返回空列表
     */
    List<String> loadCustomWords();
}
