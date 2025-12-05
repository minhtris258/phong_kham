Hướng Dẫn Quy Trình Git cho Dự Án phòng khám

Tài liệu này mô tả quy trình sử dụng Git để đóng góp vào dự án Shopee Clone.

A. Cấu Hình Ban Đầu

Fork kho lưu trữ từ GitHub của leader:

Fork từ: https://github.com/minhtris258/phong_kham.git


Clone kho đã fork về máy cục bộ:

git clone https://github.com/<tên-người-dùng-của-bạn>/phong_kham.git


Thêm kho của leader làm remote:

git remote add leader https://github.com/minhtris258/phong_kham.git



B. Làm Việc Với Nhiệm Vụ Mới

Tạo nhánh mới:

git checkout -b <tên-nhánh>


Commit các thay đổi:

git add .

git commit -m "<nội-dung-commit>"


Push nhánh lên GitHub:

git push origin <tên-nhánh>


Tạo Pull Request (PR) trên GitHub và đợi merge.

Chuyển về nhánh main:

git checkout main


Kéo code mới nhất từ kho của leader:

git pull leader main



C. Xử Lý Xung Đột (Conflict)

Chuyển về nhánh master:

git checkout master


Kéo code mới nhất từ kho của leader:

git pull leader master


Rebase nhánh của bạn lên master:

git checkout <tên-nhánh-vừa-tạo>

git rebase master


Xử lý xung đột trong các file bị ảnh hưởng, sau đó tiếp tục rebase:

git rebase --continue


Nếu không có lỗi nào, quá trình rebase hoàn tất.


Push lại code lên GitHub (force push):
git push origin <tên-nhánh-vừa-tạo> -f

client

npm i

npm run dev

server

npm i

mobile 

npm i expo

npm install babel-preset-expo --save-dev

npx expo start
