package com.blog.modules.article.model.vo;




import com.blog.modules.tag.model.vo.TagVO;
import com.blog.common.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class ArticleVO extends com.blog.common.model.vo.BaseVO {
    private String articleKey;

    private String title;

    private String slug;

    private String content;

    private String excerpt;

    private String cover;

    private Long authorId;

    private String authorName;

    private Long categoryId;

    private String categoryName;

    private String type;

    private String originalAuthor;

    private String originalTitle;

    private String originalUrl;

    private String note;

    private Integer status;

    private Integer isTop;

    private Integer viewCount;

    private Integer likeCount;

    private Integer commentCount;

    private LocalDateTime publishedAt;

    private List<TagVO> tags;

    /**
     * 版本号（用于乐观锁）
     */
    private Long version;
}

