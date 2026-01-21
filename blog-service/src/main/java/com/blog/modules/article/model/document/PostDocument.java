package com.blog.modules.article.model.document;



import lombok.Data;
import org.springframework.data.annotation.Id;
// import org.springframework.data.elasticsearch.annotations.Document;
// import org.springframework.data.elasticsearch.annotations.Field;
// import org.springframework.data.elasticsearch.annotations.FieldType;
import java.time.LocalDateTime;
import java.util.List;
@Data
// @Document(indexName = "post_index")
public class PostDocument {
    @Id
    private Long id;

    // @Field(type = FieldType.Text, analyzer = "standard", searchAnalyzer = "standard")
    private String title;

    // @Field(type = FieldType.Text, analyzer = "standard", searchAnalyzer = "standard")
    private String content;

    // @Field(type = FieldType.Text, analyzer = "standard")
    private String excerpt;

    // @Field(type = FieldType.Long)
    private Long authorId;

    // @Field(type = FieldType.Long)
    private Long categoryId;

    // @Field(type = FieldType.Long)
    private List<Long> tagIds;

    // @Field(type = FieldType.Integer)
    private Integer status;

    // @Field(type = FieldType.Date, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishedAt;

    // @Field(type = FieldType.Integer)
    private Integer viewCount;

    // @Field(type = FieldType.Integer)
    private Integer likeCount;

    // @Field(type = FieldType.Integer)
    private Integer commentCount;

    // @Field(type = FieldType.Boolean)
    private Boolean isTop;

    // @Field(type = FieldType.Date, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
