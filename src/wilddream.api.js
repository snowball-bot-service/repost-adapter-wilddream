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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lsZGRyZWFtLmFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndpbGRkcmVhbS5hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFDLDhCQUE4QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBOEQ3RDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxnQkFBZ0IsQ0FDcEMsSUFBaUIsRUFBRSxTQUFpQjtJQUVwQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQzdCLGFBQWEsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FDcEQsQ0FBQztJQUVGLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1FBQ2xCLE1BQU0sSUFBSSw4QkFBOEIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLHlDQUF5QyxDQUFDLENBQUM7S0FDeEc7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFrRkQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsb0JBQW9CLENBQ3hDLElBQWlCLEVBQUUsUUFBZ0I7SUFFbkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUM3QixzQ0FBc0Msa0JBQWtCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FDNUUsQ0FBQztJQUVGLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO1FBQ2YsTUFBTSxJQUFJLDhCQUE4QixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztLQUM5RztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQ2hDLE1BQXVCLEVBQ3ZCLE9BQWdCLE9BQU87SUFFdkIsT0FBTyxtREFBbUQsTUFBTSxXQUFXLElBQUksT0FBTyxDQUFDO0FBQ3pGLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FDaEMsTUFBdUIsRUFDdkIsU0FBMEIsRUFDMUIsT0FBNEIsU0FBUztJQUVyQyxPQUFPLG9EQUFvRCxNQUFNLElBQUksSUFBSSxJQUFJLFNBQVMsT0FBTyxDQUFDO0FBQ2hHLENBQUMifQ==