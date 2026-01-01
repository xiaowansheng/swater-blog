package com.blog.model.vo;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SearchVO {
    private String type;
    private Long id;
    private String articleKey;
    private String title;
    private String content;
    private String excerpt;
    private Map<String, List<String>> highlights;
    private Long authorId;
    private String authorName;
    private Long categoryId;
    private String categoryName;
    private List<Long> tagIds;
    private List<String> tagNames;
    private Long targetId;
    private String targetType;
    private Long userId;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private String createTime;
}

