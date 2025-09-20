import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const testResendEmail = async () => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'PhongTro Modern <onboarding@resend.dev>',
      to: 'vumanhbao0411@gmail.com',
      subject: 'Xác thực tài khoản PhongTro Modern',
      html: `
        <h1>Xác thực tài khoản của bạn</h1>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại PhongTro Modern.</p>
        <p>Vui lòng click vào link bên dưới để xác thực tài khoản:</p>
        <a href="http://localhost:3000/verify-email?token=test-token">Xác thực tài khoản</a>
        <p>Link xác thực sẽ hết hạn sau 24 giờ.</p>
        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully! ID:', data.id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testResendEmail();