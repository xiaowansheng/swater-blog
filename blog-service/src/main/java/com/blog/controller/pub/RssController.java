package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.model.vo.ArticleVO;
import com.blog.service.ArticlePublicQueryService;
import com.rometools.rome.feed.rss.Channel;
import com.rometools.rome.feed.rss.Description;
import com.rometools.rome.feed.rss.Item;
import com.rometools.rome.io.WireFeedOutput;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/public/rss")
@ApiResource(name = "RSS订阅接口", isOpen = true)
public class RssController {
    
    @Autowired
    private ArticlePublicQueryService articlePublicQueryService;
    
    @Value("${spring.application.name:Swater Blog}")
    private String siteName;
    
    @GetMapping(produces = "application/rss+xml;charset=UTF-8")
    public ResponseEntity<String> rss(HttpServletRequest request) {
        try {
            String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();
            
            Channel channel = new Channel("rss_2.0");
            channel.setTitle(siteName);
            channel.setLink(baseUrl);
            channel.setDescription(siteName + " RSS Feed");
            channel.setLanguage("zh-CN");
            channel.setLastBuildDate(new Date());
            
            List<Item> items = new ArrayList<>();
            List<ArticleVO> articles = articlePublicQueryService.getLatestArticles(20);
            
            for (ArticleVO article : articles) {
                Item item = new Item();
                item.setTitle(article.getTitle());
                
                String articleUrl = baseUrl + "/post/";
                if (article.getSlug() != null && !article.getSlug().isEmpty()) {
                    articleUrl += article.getSlug();
                } else {
                    articleUrl += article.getId();
                }
                item.setLink(articleUrl);
                
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
            return ResponseEntity.internalServerError().build();
        }
    }
}

