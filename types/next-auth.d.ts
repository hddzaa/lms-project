import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      username?: string;
      mapel?: string;
    };
  }

  interface User {
    role?: string;
    username?: string;
    mapel?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    username?: string;
    mapel?: string;
  }
}