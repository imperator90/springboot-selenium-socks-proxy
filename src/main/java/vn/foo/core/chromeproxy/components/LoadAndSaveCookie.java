package vn.foo.core.chromeproxy.components;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.foo.core.chromeproxy.JsonSerializer;
import vn.foo.core.chromeproxy.domain.MyCookie;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/cookies")
public class LoadAndSaveCookie {
    public static File configCookie = new File("config/cookie.json");
    @Autowired
    WebDriver driver;

    @GetMapping("/load")
    public String load() {
        List<MyCookie> cookies = new ArrayList<>();
        if (configCookie.exists()) {
            cookies = JsonSerializer.file2JsonObject(configCookie, MyCookie.class);
        }

        if (!cookies.isEmpty()) {
            cookies.forEach(cookie -> driver.manage().addCookie(cookie.build()));
        }
        return "loaded";
    }

    @GetMapping("/save")
    public String save() {
        Set<Cookie> cookiesForCurrentURL = driver.manage().getCookies();
        JsonSerializer.object2JsonIntoFile(cookiesForCurrentURL, true, configCookie);

        return "saved";
    }
}
