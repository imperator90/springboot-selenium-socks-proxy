package vn.foo.core.chromeproxy.components;

import com.google.common.collect.ImmutableBiMap;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/")
public class TestMeNow {

    @Autowired
    WebDriver webDriver;

    @GetMapping
    public Map map(@RequestParam(name = "url") String url) {
        webDriver.get(url);
        return ImmutableMap.of("fff", "ss");
    }
}
