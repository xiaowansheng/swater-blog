package com.blog.config;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.router.SaRouter;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SaTokenConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handler -> {
            // 登录校验 -- 拦截所有 admin 接口
            SaRouter.match("/api/admin/**")
                    .notMatch("/api/auth/**")
                    .check(r -> {
                        // 放行 OPTIONS 请求
                        if (SaHolder.getRequest().getMethod().equals("OPTIONS")) {
                            return;
                        }
                        StpUtil.checkLogin();
                    });
        })).addPathPatterns("/**");
    }
}

