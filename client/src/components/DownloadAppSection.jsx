import React from "react";

const DownloadAppSection = () => {
  return (
    <section>
      <div className="flex text-center items-center justify-center pt-16 ">
        <h2 className="color-title lg:text-4xl text-xl font-bold py-4 mb-8 text-center">
          Tải ứng dụng Đặt khám nhanh
        </h2>
        <h2 className="hidden lg:block text-[#16B7D7] lg:text-4xl text-xl font-bold py-4 mb-8 text-center lg:ml-2">
          Med Pro
        </h2>
      </div>

      <div className="flex gap-4 justify-center py-8">
        <img
          src="https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2Fa99f5240-f39c-40d7-a340-aa4b68b90fb5-icon_download_google_play.svg&w=1920&q=75"
          alt="Tải trên Google Play"
        />
        <img
          src="https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2Fecbe7465-3d2a-4f1d-985e-4cf14dd30924-logo_download_ios.svg&w=1920&q=75"
          alt="Tải trên App Store"
        />
      </div>

      <div className="container">
        <div className="hidden lg:grid lg:grid-cols-3 gap-4">
          {/* Cột trái */}
          <div className="col-span-1">
            <div className="py-20 mt-8">
              <div>
                <h2 className="color-title font-bold font-roboto text-xl text-end">
                  Tra cứu kết quả cận lâm sàng
                </h2>
                <p className="pb-8 text-end text-base text-gray-500">
                  Tra cứu kết quả cận lâm sàng trực tuyến dễ dàng và tiện lợi.
                </p>
              </div>

              <div className="mr-5">
                <h2 className="color-title font-bold font-roboto text-xl text-end">
                  Lấy số thứ tự khám nhanh trực tuyến
                </h2>
                <p className="pb-8 text-end text-base text-gray-500">
                  Đăng ký khám / tái khám nhanh theo ngày
                  <br />
                  Đăng ký khám theo bác sĩ chuyên khoa
                  <br />
                  Tái khám theo lịch hẹn.
                </p>
              </div>

              <div>
                <h2 className="color-title font-bold font-roboto text-xl text-end">
                  Tư vấn sức khỏe từ xa
                </h2>
                <p className="pb-8 text-end text-base text-gray-500">
                  Tư vấn sức khỏe từ xa, cuộc gọi video với các bác sĩ chuyên
                  môn.
                </p>
              </div>
            </div>
          </div>

          {/* Cột giữa: Hình app */}
          <div className="col-span-1 relative">
            <img
              src="https://medpro.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fellipse.a457aed3.png&w=1920&q=75"
              alt=""
              className="z-10 absolute top-20"
            />
            <img
              src="https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F858c322c-7f26-48d3-a5df-e633e9a3592e-20240325-095443.png&w=1920&q=75"
              alt="app2"
              className="absolute z-40 top-0 w-auto h-150 mx-auto left-[50%] transform -translate-x-1/2"
            />
          </div>

          {/* Cột phải */}
          <div className="col-span-1">
            <div className="py-20 mt-8">
              <div>
                <h2 className="color-title font-bold font-roboto text-xl">
                  Thanh toán viện phí
                </h2>
                <p className="pb-8 text-base text-gray-500">
                  Đa dạng hệ thống thanh toán trực tuyến. Hỗ trợ các ví điện tử
                  thịnh hành hiện nay.
                </p>
              </div>

              <div className="ml-5">
                <h2 className="color-title font-bold font-roboto text-xl">
                  Chăm sóc Y tế tại nhà
                </h2>
                <p className="pb-8 text-base text-gray-500">
                  Dịch vụ Y tế tại nhà chuyên nghiệp, đáp ứng các nhu cầu chăm
                  sóc Y tế tại nhà phổ thông.
                </p>
              </div>

              <div>
                <h2 className="color-title font-bold font-roboto text-xl">
                  Mạng lưới Cơ sở hợp tác
                </h2>
                <p className="pb-6 text-base text-gray-500">
                  Mạng lưới kết nối với các bệnh viện, phòng khám, phòng mạch
                  rộng khắp phủ sóng toàn quốc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
