package com.blog.modules.rss.controller.pub;

import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.article.service.ArticlePublicService;
import com.blog.modules.system.config.model.dto.config.SiteConfigDTO;
import com.blog.modules.system.config.service.SiteConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RssControllerTest {

    @Mock
    private ArticlePublicService articlePublicService;

    @Mock
    private SiteConfigService siteConfigService;

    private RssController controller;

    @BeforeEach
    void setUp() {
        controller = new RssController();
        ReflectionTestUtils.setField(controller, "articlePublicService", articlePublicService);
        ReflectionTestUtils.setField(controller, "siteConfigService", siteConfigService);
        ReflectionTestUtils.setField(controller, "siteName", "Swater Blog");
        ReflectionTestUtils.setField(controller, "configuredSiteUrl", "https://blog.example.com/");
        ReflectionTestUtils.setField(controller, "defaultLocale", "zh");
    }

    @Test
    void rssUsesConfiguredSiteUrlAndArticleKeyLinks() {
        SiteConfigDTO siteConfig = new SiteConfigDTO();
        siteConfig.setName("My Blog");
        siteConfig.setDescription("Latest posts");

        ArticleVO article = new ArticleVO();
        article.setId(1L);
        article.setArticleKey("stable-key");
        article.setSlug("legacy-slug");
        article.setTitle("Hello RSS");
        article.setExcerpt("RSS excerpt");
        article.setPublishedAt(LocalDateTime.of(2026, 5, 27, 10, 0));

        when(siteConfigService.getSiteConfig()).thenReturn(siteConfig);
        when(articlePublicService.getLatestArticles(20)).thenReturn(List.of(article));

        ResponseEntity<String> response = controller.rss(new MockHttpServletRequest("GET", "/api/public/rss"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isNotNull();
        assertThat(response.getHeaders().getContentType().isCompatibleWith(MediaType.parseMediaType("application/rss+xml"))).isTrue();
        assertThat(response.getBody())
                .contains("<title>My Blog</title>")
                .contains("<description>Latest posts</description>")
                .contains("<link>https://blog.example.com</link>")
                .contains("https://blog.example.com/zh/post/stable-key")
                .doesNotContain("legacy-slug")
                .doesNotContain("/post/1");
    }

    @Test
    void rssFallsBackToRequestBaseUrlAndSlugWhenConfiguredSiteUrlIsBlank() {
        ReflectionTestUtils.setField(controller, "configuredSiteUrl", "");
        ReflectionTestUtils.setField(controller, "defaultLocale", "/en/");

        SiteConfigDTO siteConfig = new SiteConfigDTO();
        siteConfig.setName("Request Blog");

        ArticleVO article = new ArticleVO();
        article.setId(2L);
        article.setSlug("fallback-slug");
        article.setTitle("Fallback RSS");
        article.setPublishedAt(LocalDateTime.of(2026, 5, 27, 11, 0));

        when(siteConfigService.getSiteConfig()).thenReturn(siteConfig);
        when(articlePublicService.getLatestArticles(20)).thenReturn(List.of(article));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/public/rss");
        request.setScheme("https");
        request.setServerName("web.example.com");
        request.setServerPort(443);

        ResponseEntity<String> response = controller.rss(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody())
                .contains("<link>https://web.example.com</link>")
                .contains("https://web.example.com/en/post/fallback-slug");
    }
}
