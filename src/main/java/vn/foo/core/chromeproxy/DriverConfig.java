package vn.foo.core.chromeproxy;

import org.apache.sshd.client.SshClient;
import org.apache.sshd.client.keyverifier.AcceptAllServerKeyVerifier;
import org.apache.sshd.client.session.ClientSession;
import org.apache.sshd.common.config.keys.loader.putty.PuttyKeyUtils;
import org.apache.sshd.common.forward.PortForwardingEventListener;
import org.apache.sshd.common.session.Session;
import org.apache.sshd.common.session.SessionContext;
import org.apache.sshd.common.util.net.SshdSocketAddress;
import org.apache.sshd.server.forward.AcceptAllForwardingFilter;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.util.Collection;

@Configuration
public class DriverConfig {

    @Value("${myconfig.ssh.host}")
    String sshHost;
    @Value("${myconfig.ssh.port}")
    Integer sshPort;
    @Value("${myconfig.ssh.user}")
    String sshUsername;
    @Value("${myconfig.ssh.pass}")
    String sshPassword;

    @Value("${myconfig.socks5.host}")
    String socks5Host;
    @Value("${myconfig.socks5.port}")
    Integer socks5Port;

    private static ChromeDriverService service;
    public static SshdSocketAddress sshdSocketAddress;
    public static SshClient client;
    public static ClientSession session;

    public void initSocks5Proxy() {
        client = SshClient.setUpDefaultClient();
        client.setForwardingFilter(AcceptAllForwardingFilter.INSTANCE);
        client.setServerKeyVerifier(AcceptAllServerKeyVerifier.INSTANCE);
        client.start();

        try{
            session = client.connect(sshUsername, sshHost, sshPort).verify().getSession();
            session.addPasswordIdentity(sshPassword);

            session.auth().verify(10000);

            session.addPortForwardingEventListener(new PortForwardingEventListener() {
                @Override
                public void establishedDynamicTunnel(Session session, SshdSocketAddress local,
                                                     SshdSocketAddress boundAddress, Throwable reason) throws IOException {
                    //PortForwardingEventListener.EMPTY.establishedDynamicTunnel(session, local, boundAddress, reason);
                    PortForwardingEventListener.super.establishedDynamicTunnel(session, local, boundAddress, reason);
                    System.out.println("Dynamic Forword Tunnel is Ready");
                }
            });
            sshdSocketAddress = session.startDynamicPortForwarding(new SshdSocketAddress(socks5Host, socks5Port));
            System.out.println("Host: " + sshdSocketAddress.getHostName());
            System.out.println("Port: " + sshdSocketAddress.getPort());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Bean
    public WebDriver getDriver() throws IOException {
        service = getDriverService();
        service.start();

        initSocks5Proxy();

        File extensionFolder = new File("files/tong_hop");

        ChromeOptions options = new ChromeOptions();
        options.addArguments(String.format("--proxy-server=socks5://%s:%s", socks5Host, socks5Port), "load-extension=" + extensionFolder.getAbsolutePath());

        WebDriver driver = new RemoteWebDriver(service.getUrl(), options);
        driver.get("https://www.google.com/");
		driver.get("http://localhost:8899/cookies/load");
		driver.get("https://thiendia.me/diendan/forums/nhat-ki-may-mua.82/");
        return driver;
    }

    public ChromeDriverService getDriverService() {
        File browserFile = new File("files/chromedriver.exe");
        return new ChromeDriverService.Builder()
                .usingDriverExecutable(browserFile)
                .usingAnyFreePort()
                .build();
    }
}
