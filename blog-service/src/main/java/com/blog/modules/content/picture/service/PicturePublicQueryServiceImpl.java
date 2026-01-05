package com.blog.modules.content.picture.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.modules.album.mapper.AlbumMapper;
import com.blog.modules.content.picture.mapper.PictureMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.album.model.entity.Album;
import com.blog.modules.content.picture.model.entity.Picture;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.content.picture.model.vo.PictureVO;
import com.blog.modules.content.picture.service.PicturePublicQueryService;
import com.blog.common.util.BeanUtil;
import com.blog.common.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class PicturePublicQueryServiceImpl implements PicturePublicQueryService {
    @Autowired
    private PictureMapper pictureMapper;

    @Autowired
    private AlbumMapper albumMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public PageResult<PictureVO> list(Long page, Long size, Long albumId) {
        Page<Picture> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Picture> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Picture::getStatus, "1");

        if (albumId != null) {
            wrapper.eq(Picture::getAlbumId, albumId);
        }

        wrapper.orderByDesc(Picture::getCreateTime);

        Page<Picture> result = pictureMapper.selectPage(pageParam, wrapper);
        List<PictureVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public PictureVO getById(Long id) {
        Picture picture = pictureMapper.selectOne(new LambdaQueryWrapper<Picture>()
                .eq(Picture::getId, id)
                .eq(Picture::getStatus, "1"));
        if (picture == null) {
            return null;
        }
        return convertToVO(picture);
    }

    private PictureVO convertToVO(Picture picture) {
        PictureVO vo = BeanUtil.copyProperties(picture, PictureVO.class);
        if (picture.getUserId() != null) {
            User user = userMapper.selectById(picture.getUserId());
            if (user != null) {
                vo.setUserName(user.getUsername());
                vo.setUserNickname(user.getNickname());
            }
        }
        if (picture.getAlbumId() != null) {
            Album album = albumMapper.selectById(picture.getAlbumId());
            if (album != null) {
                vo.setAlbumName(album.getName());
            }
        }
        return vo;
    }
}

