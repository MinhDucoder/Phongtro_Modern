import nodemailer from 'nodemailer';

const testEtherealEmail = async () => {
  try {
    // Tạo tài khoản test
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created:', testAccount);

    // Tạo transporter với tài khoản test
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Gửi email test
    const info = await transporter.sendMail({
      from: '"PhongTro Modern" <test@example.com>',
      to: 'vumanhbao0411@gmail.com',
      subject: 'Test Email ✔',
      text: 'Đây là email test',
      html: '<b>Đây là email test</b>',
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('Error:', error);
  }
};

testEtherealEmail();