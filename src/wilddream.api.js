import { FetchHandleDataFailedException } from "./utils/error";
/**
 * 获取绘画作品数据
 *
 * GET https://www.wilddream.net/Art/view/{artworkId}/ajax/1
 *
 * @param http HTTP 客户端
 * @param artworkId 作品 ID
 */
export async function fetchArtworkData(http, artworkId) {
    const data = await http.getJson(`/Art/view/${encodeURIComponent(artworkId)}/ajax/1`);
    if (!data?.success) {
        throw new FetchHandleDataFailedException("post", artworkId, "Artwork response success flag is false.");
    }
    return data;
}
/**
 * 获取用户页面数据
 *
 * GET https://www.wilddream.net/Art/userpage/profile/userpagename/{userName}/ajax/1
 *
 * @param http HTTP 客户端
 * @param userName 用户主页名 (userpagename)
 */
export async function fetchUserProfileData(http, userName) {
    const data = await http.getJson(`/Art/userpage/profile/userpagename/${encodeURIComponent(userName)}/ajax/1`);
    if (!data?.user) {
        throw new FetchHandleDataFailedException("profile", userName, "User profile response is missing user data.");
    }
    return data;
}
/**
 * 获取用户头像 URL
 * @param userId
 * @param size
 */
export function getUserHeadshotURL(userId, size = "large") {
    return `https://www.wilddream.net/Public/uploads/avatar/${userId}/avatar_${size}.webp`;
}
/**
 * 获取绘画图片 URL
 * @param userId
 * @param artworkId
 * @param size
 */
export function getArtworkImageURL(userId, artworkId, size = "preview") {
    return `https://www.wilddream.net/Public/uploads/artwork/${userId}/${size}/${artworkId}.webp`;
}
