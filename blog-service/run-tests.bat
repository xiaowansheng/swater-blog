@echo off
echo ========================================
echo 运行Blog服务测试套件
echo ========================================

echo.
echo 1. 运行单元测试...
call gradlew test --tests "com.blog.service.*" --tests "com.blog.util.*"

echo.
echo 2. 运行集成测试...
call gradlew test --tests "com.blog.controller.*"

echo.
echo 3. 运行完整测试套件...
call gradlew test

echo.
echo 4. 生成测试报告...
call gradlew jacocoTestReport

echo.
echo 5. 检查代码覆盖率...
call gradlew jacocoTestCoverageVerification

echo.
echo ========================================
echo 测试完成！
echo 测试报告位置: build/reports/tests/test/index.html
echo 覆盖率报告位置: build/reports/jacoco/test/html/index.html
echo ========================================

pause