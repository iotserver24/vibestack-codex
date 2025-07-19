import { getGithubUser } from "../handlers/github_handlers";

export async function getGitAuthor() {
  const user = await getGithubUser();
  const author = user
    ? {
        name: `[CodeX]`,
        email: user.email,
      }
    : {
        name: "[CodeX]",
        email: "iotserver24@gmail.com",
      };
  return author;
}
