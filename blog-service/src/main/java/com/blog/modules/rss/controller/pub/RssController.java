package com.blog.modules.rss.controller.pub;



import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.model.enums.ApiOperationType;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.article.service.ArticlePublicService;
import com.blog.modules.system.config.model.dto.config.SiteConfigDTO;
import com.blog.modules.system.config.service.SiteConfigService;
import com.rometools.rome.feed.rss.Channel;
import com.rometools.rome.feed.rss.Description;
import com.rometools.rome.feed.rss.Guid;
import com.rometools.rome.feed.rss.Item;
import com.rometools.rome.io.WireFeedOutput;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/public/rss")
@ApiOperation(name = "RSS订阅接口", description = "RSS订阅相关接口", open = true)
public class RssController {
    
    @Autowired
    private ArticlePublicService articlePublicService;

    @Autowired
    private SiteConfigService siteConfigService;
    
    @Value("${spring.application.name:Swater Blog}")
    private String siteName;

    @Value("${blog.site-url:}")
    private String configuredSiteUrl;

    @Value("${blog.rss.default-locale:zh}")
    private String defaultLocale;
    
    @GetMapping(produces = "application/rss+xml;charset=UTF-8")
    @ApiOperation(name = "获取RSS订阅", type = ApiOperationType.QUERY, description = "获取网站的RSS订阅内容")
    public ResponseEntity<String> rss(HttpServletRequest request) {
        try {
            String baseUrl = resolveSiteUrl(request);
            SiteConfigDTO siteConfig = siteConfigService.getSiteConfig();
            String feedTitle = firstNonBlank(siteConfig != null ? siteConfig.getName() : null, siteName, "Swater Blog");
            String feedDescription = firstNonBlank(
                    siteConfig != null ? siteConfig.getDescription() : null,
                    feedTitle + " RSS Feed"
            );
            
            Channel channel = new Channel("rss_2.0");
            channel.setTitle(feedTitle);
            channel.setLink(baseUrl);
            channel.setDescription(feedDescription);
            channel.setLanguage("zh-CN");
            channel.setLastBuildDate(new Date());
            
            List<Item> items = new ArrayList<>();
            List<ArticleVO> articles = articlePublicService.getLatestArticles(20);
            if (articles == null) {
                articles = List.of();
            }
            
            for (ArticleVO article : articles) {
                Item item = new Item();
                item.setTitle(article.getTitle());
                
                String articleKey = firstNonBlank(
                        article.getArticleKey(),
                        article.getSlug(),
                        article.getId() != null ? article.getId().toString() : null
                );
                if (!StringUtils.hasText(articleKey)) {
                    continue;
                }
                String articleUrl = buildArticleUrl(baseUrl, articleKey);
                item.setLink(articleUrl);

                Guid guid = new Guid();
                guid.setPermaLink(true);
                guid.setValue(articleUrl);
                item.setGuid(guid);
                
                Description description = new Description();
                String descText = article.getExcerpt() != null && !article.getExcerpt().isEmpty() 
                        ? article.getExcerpt() 
                        : article.getTitle();
                description.setValue(descText);
                item.setDescription(description);
                
                if (article.getPublishedAt() != null) {
                    item.setPubDate(Date.from(article.getPublishedAt()
                            .atZone(ZoneId.systemDefault())
                            .toInstant()));
                }
                
                items.add(item);
            }
            
            channel.setItems(items);
            
            WireFeedOutput output = new WireFeedOutput();
            String xml = output.outputString(channel);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/rss+xml;charset=UTF-8"));
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(xml);
        } catch (Exception e) {
            log.error("Failed to generate RSS feed", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String resolveSiteUrl(HttpServletRequest request) {
        if (StringUtils.hasText(configuredSiteUrl)) {
            return trimTrailingSlash(configuredSiteUrl.trim());
        }

        String requestBaseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                .replacePath(null)
                .build()
                .toUriString();
        return trimTrailingSlash(requestBaseUrl);
    }

    private String buildArticleUrl(String baseUrl, String articleKey) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl);
        String locale = normalizePathSegment(defaultLocale);
        if (StringUtils.hasText(locale)) {
            builder.pathSegment(locale);
        }
        return builder.pathSegment("post", articleKey)
                .build()
                .encode()
                .toUriString();
    }

    private String trimTrailingSlash(String value) {
        while (value.endsWith("/") && value.length() > 1) {
            value = value.substring(0, value.length() - 1);
        }
        return value;
    }

    private String normalizePathSegment(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value.trim().replaceAll("^/+|/+$", "");
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return "";
    }
}
