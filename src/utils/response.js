// Format response API
const responseSuccess = (res, status = 200, data = null, message = "Berhasil") => {
  return res.status(status).json({
    status: "success",
    message,
    data,
  });
};

const responseError = (res, status = 500, message = "Terjadi kesalahan pada server") => {
  return res.status(status).json({
    status: "error",
    message,
  });
};

export { responseSuccess, responseError };
