package com.blog.modules.album.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.album.mapper.AlbumMapper;
import com.blog.modules.content.picture.mapper.PictureMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.album.model.entity.Album;
import com.blog.modules.content.picture.model.entity.Picture;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.album.model.vo.AlbumVO;
import com.blog.modules.content.picture.model.vo.PictureVO;
import com.blog.modules.album.service.AlbumPublicQueryService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class AlbumPublicQueryServiceImpl implements AlbumPublicQueryService {
    @Autowired
    private AlbumMapper albumMapper;

    @Autowired
    private PictureMapper pictureMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public PageResult<AlbumVO> list(Long page, Long size) {
        Page<Album> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Album> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Album::getStatus, "1")
                .orderByDesc(Album::getCreateTime);

        Page<Album> result = albumMapper.selectPage(pageParam, wrapper);
        List<AlbumVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public AlbumVO getById(Long id) {
        Album album = albumMapper.selectOne(new LambdaQueryWrapper<Album>()
                .eq(Album::getId, id)
                .eq(Album::getStatus, "1"));
        if (album == null) {
            return null;
        }
        AlbumVO vo = convertToVO(album);
        List<Picture> pictures = pictureMapper.selectByAlbumId(id);
        if (pictures != null && !pictures.isEmpty()) {
            List<PictureVO> pictureVOs = pictures.stream()
                    .map(p -> {
                        PictureVO pvo = BeanUtil.copyProperties(p, PictureVO.class);
                        pvo.setAlbumName(album.getName());
                        return pvo;
                    })
                    .collect(Collectors.toList());
            vo.setPictures(pictureVOs);
        }
        return vo;
    }

    @Override
    public AlbumVO getByKey(String key) {
        Album album = albumMapper.selectOne(new LambdaQueryWrapper<Album>()
                .eq(Album::getAlbumKey, key)
                .eq(Album::getStatus, "1"));
        if (album == null) {
            return null;
        }
        AlbumVO vo = convertToVO(album);
        List<Picture> pictures = pictureMapper.selectByAlbumId(album.getId());
        if (pictures != null && !pictures.isEmpty()) {
            List<PictureVO> pictureVOs = pictures.stream()
                    .map(p -> {
                        PictureVO pvo = BeanUtil.copyProperties(p, PictureVO.class);
                        pvo.setAlbumName(album.getName());
                        return pvo;
                    })
                    .collect(Collectors.toList());
            vo.setPictures(pictureVOs);
        }
        return vo;
    }

    private AlbumVO convertToVO(Album album) {
        AlbumVO vo = BeanUtil.copyProperties(album, AlbumVO.class);
        if (album.getUserId() != null) {
            User user = userMapper.selectById(album.getUserId());
            if (user != null) {
                vo.setUserName(user.getUsername());
                vo.setUserNickname(user.getNickname());
            }
        }
        Integer pictureCount = pictureMapper.countByAlbumId(album.getId());
        vo.setPictureCount(pictureCount != null ? pictureCount : 0);
        return vo;
    }
}

