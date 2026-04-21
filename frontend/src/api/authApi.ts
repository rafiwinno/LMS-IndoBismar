import API from "./api";

export const loginPeserta = async (email: string, password: string) => {
    const res = await API.post("/login/peserta", { email, password });
    return res.data;
}

export const logoutUser = async () => {
    const res = await API.post("/logout");
    return res.data;
};