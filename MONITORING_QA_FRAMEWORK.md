# Monitoring & QA Framework — Complete Implementation Guide

**Purpose**: Real-time monitoring of image generation, error tracking, and automated QA audits  
**Status**: Ready for implementation  
**Timeline**: Phase 1 (1-2 weeks)

---

## 📊 **Architecture Overview**

```
USER ACTIONS
    ↓
EDGE FUNCTION (generate-product-image)
    ↓
    ├─ Success → Save to Database
    │           └─ Log metrics
    │
    └─ Error → Catch & Log
              ├─ Error type (401, 429, 500, timeout, etc.)
              ├─ Stack trace
              ├─ User/Product context
              └─ Retry attempt count

DATABASE TABLES
├─ image_generation_logs (every attempt)
├─ image_generation_errors (failures only)
├─ image_generation_metrics (aggregated stats)
├─ user_feedback (manual feedback)
└─ qa_audit_results (health checks)

MONITORING DASHBOARD
├─ Real-time error tracking
├─ Success rate by product/user
├─ Performance metrics
├─ User satisfaction trends
└─ Automated alerts
```

---

## 📋 **Phase 1: Database Schema (Create These Tables)**

### **1. image_generation_logs** (Every attempt - success or failure)

```sql
CREATE TABLE image_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  frame_id UUID,
  
  -- Generation details
  generation_type TEXT, -- 'virtual_tryon', 'admin_individual', 'batch'
  mode TEXT, -- 'plan', 'check', 'do', 'act'
  
  -- Each angle/shot
  shot_number INTEGER, -- 1-6 (which angle)
  shot_type TEXT, -- 'hero', 'front', 'mannequin', 'lifestyle_male', 'lifestyle_female', 'spec_diagram'
  
  -- Status
  status TEXT, -- 'started', 'success', 'failed', 'retrying'
  
  -- Timing
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER, -- end_time - start_time in milliseconds
  
  -- Result
  image_url TEXT,
  error_code TEXT,
  error_message TEXT,
  
  -- Attempt tracking
  attempt_number INTEGER DEFAULT 1,
  max_retries INTEGER DEFAULT 3,
  
  -- Performance
  api_calls_used INTEGER,
  api_cost_estimate DECIMAL,
  
  -- User device context
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  os_name TEXT, -- 'iOS', 'Android', 'Windows', 'macOS'
  browser_name TEXT,
  device_memory_mb INTEGER,
  
  -- Metadata
  metadata JSONB, -- flexible storage for additional context
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generation_logs_user ON image_generation_logs(user_id);
CREATE INDEX idx_generation_logs_product ON image_generation_logs(product_id);
CREATE INDEX idx_generation_logs_status ON image_generation_logs(status);
CREATE INDEX idx_generation_logs_created ON image_generation_logs(created_at);
CREATE INDEX idx_generation_logs_error ON image_generation_logs(error_code);
```

---

### **2. image_generation_errors** (Failure tracking)

```sql
CREATE TABLE image_generation_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  log_id UUID REFERENCES image_generation_logs(id) ON DELETE CASCADE,
  
  -- Error classification
  error_type TEXT, -- 'api_error', 'timeout', 'face_detection', 'frame_fit', 'memory', 'auth', 'network', 'unknown'
  error_code TEXT, -- '401', '429', '500', 'TIMEOUT', 'FACE_NOT_DETECTED', etc.
  error_message TEXT,
  stack_trace TEXT,
  
  -- Severity
  severity TEXT, -- 'critical', 'high', 'medium', 'low'
  
  -- Recovery
  auto_retry_scheduled BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0,
  retry_successful BOOLEAN,
  
  -- User impact
  user_visible BOOLEAN, -- should user see this error?
  suggested_action TEXT, -- "Try a different photo" or "API overloaded, retry in 30s"
  
  -- Root cause analysis
  suspected_cause TEXT,
  root_cause_confirmed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_errors_type ON image_generation_errors(error_type);
CREATE INDEX idx_errors_severity ON image_generation_errors(severity);
CREATE INDEX idx_errors_created ON image_generation_errors(created_at);
```

---

### **3. image_generation_metrics** (Aggregated stats - updated hourly)

```sql
CREATE TABLE image_generation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time bucket
  hour TIMESTAMP WITH TIME ZONE,
  date DATE,
  
  -- Counts
  total_attempts INTEGER DEFAULT 0,
  successful INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  retried INTEGER DEFAULT 0,
  
  -- Rates
  success_rate DECIMAL(5,2), -- 95.5
  failure_rate DECIMAL(5,2),
  average_retries DECIMAL(3,2),
  
  -- Performance
  avg_duration_ms INTEGER,
  p50_duration_ms INTEGER, -- median
  p95_duration_ms INTEGER, -- 95th percentile
  max_duration_ms INTEGER,
  
  -- Errors
  api_errors INTEGER DEFAULT 0,
  timeout_errors INTEGER DEFAULT 0,
  face_detection_errors INTEGER DEFAULT 0,
  frame_fit_errors INTEGER DEFAULT 0,
  memory_errors INTEGER DEFAULT 0,
  auth_errors INTEGER DEFAULT 0,
  
  -- Device breakdown
  mobile_success_rate DECIMAL(5,2),
  desktop_success_rate DECIMAL(5,2),
  ios_success_rate DECIMAL(5,2),
  android_success_rate DECIMAL(5,2),
  
  -- Cost
  total_api_calls INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_metrics_hour ON image_generation_metrics(hour);
CREATE INDEX idx_metrics_date ON image_generation_metrics(date);
```

---

### **4. qa_audit_results** (Automated health checks)

```sql
CREATE TABLE qa_audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Audit run
  audit_type TEXT, -- 'daily', 'hourly', 'on_demand'
  audit_name TEXT, -- 'edge_function_health', 'gemini_api_health', 'frame_fitting_quality', etc.
  
  -- Results
  status TEXT, -- 'passed', 'failed', 'warning'
  score INTEGER, -- 0-100
  
  -- Checks
  checks_passed INTEGER,
  checks_failed INTEGER,
  checks_total INTEGER,
  
  -- Findings
  findings JSONB, -- {failed_checks: [...], warnings: [...], metrics: {...}}
  
  -- Alerts
  alert_triggered BOOLEAN DEFAULT FALSE,
  alert_severity TEXT, -- 'critical', 'high', 'medium', 'low'
  alert_recipients TEXT[], -- ['ops@...', 'dev@...']
  
  -- Performance
  duration_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_qa_audit_type ON qa_audit_results(audit_type);
CREATE INDEX idx_qa_audit_status ON qa_audit_results(status);
CREATE INDEX idx_qa_audit_created ON qa_audit_results(created_at);
```

---

### **5. user_feedback** (Track manual feedback)

```sql
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id UUID REFERENCES auth.users(id),
  
  -- Feedback
  feedback_type TEXT, -- 'positive', 'negative', 'bug_report', 'feature_request'
  message TEXT,
  
  -- Context
  product_id UUID REFERENCES products(id),
  page TEXT, -- 'virtual_try_on', 'admin_dashboard', 'shop'
  
  -- Metadata
  device_type TEXT,
  browser_name TEXT,
  timestamp_reported TIMESTAMP WITH TIME ZONE,
  
  -- Status
  reviewed BOOLEAN DEFAULT FALSE,
  assigned_to TEXT, -- developer email
  status TEXT, -- 'new', 'investigating', 'fixed', 'wontfix'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_status ON user_feedback(status);
CREATE INDEX idx_feedback_type ON user_feedback(feedback_type);
CREATE INDEX idx_feedback_created ON user_feedback(created_at);
```

---

## 🔧 **Phase 2: Modify Edge Function (generate-product-image)**

### **Add Logging at Every Step**

```typescript
// At the TOP of your Edge Function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper: Log every attempt
async function logGeneration(context: {
  userId?: string;
  productId: string;
  shotType: string;
  status: 'started' | 'success' | 'failed';
  duration?: number;
  imageUrl?: string;
  errorCode?: string;
  errorMessage?: string;
  deviceType?: string;
  osName?: string;
}) {
  try {
    await supabase.from('image_generation_logs').insert([{
      user_id: context.userId,
      product_id: context.productId,
      shot_type: context.shotType,
      status: context.status,
      duration_ms: context.duration,
      image_url: context.imageUrl,
      error_code: context.errorCode,
      error_message: context.errorMessage,
      device_type: context.deviceType,
      os_name: context.osName,
      start_time: new Date(),
    }]);
  } catch (err) {
    console.error('Failed to log generation:', err);
  }
}

// Helper: Log errors
async function logError(context: {
  logId: string;
  errorType: 'api_error' | 'timeout' | 'face_detection' | 'memory' | 'auth' | 'network';
  errorCode: string;
  errorMessage: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedAction: string;
}) {
  try {
    await supabase.from('image_generation_errors').insert([{
      log_id: context.logId,
      error_type: context.errorType,
      error_code: context.errorCode,
      error_message: context.errorMessage,
      severity: context.severity,
      user_visible: true,
      suggested_action: context.suggestedAction,
    }]);
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}

// MAIN FUNCTION - Wrap everything
async function generateProductImage(req: Request) {
  const startTime = Date.now();
  const logId = crypto.randomUUID();
  
  try {
    // Parse request
    const { productId, shotType } = await req.json();
    
    // Log start
    await logGeneration({
      productId,
      shotType,
      status: 'started',
    });
    
    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (productError) {
      throw new Error(`Product not found: ${productError.message}`);
    }
    
    // Generate image
    const { imageUrl, error: geminiError } = await generateImageViaGemini(
      buildPrompt(product, shotType),
      GEMINI_API_KEY
    );
    
    if (geminiError) {
      // Determine error type
      let errorType = 'api_error';
      let severity = 'high';
      let suggestedAction = 'Try again later';
      
      if (geminiError.message.includes('401')) {
        errorType = 'auth';
        severity = 'critical';
        suggestedAction = 'API authentication failed - contact support';
      } else if (geminiError.message.includes('429')) {
        errorType = 'api_error';
        severity = 'high';
        suggestedAction = 'API rate limited - try again in 30 seconds';
      } else if (geminiError.message.includes('timeout')) {
        errorType = 'timeout';
        severity = 'medium';
        suggestedAction = 'Request timed out - try a different photo';
      } else if (geminiError.message.includes('face')) {
        errorType = 'face_detection';
        severity = 'high';
        suggestedAction = 'Face not detected - try a clearer photo with better lighting';
      }
      
      // Log the error
      await logError({
        logId,
        errorType,
        errorCode: geminiError.code || 'UNKNOWN',
        errorMessage: geminiError.message,
        severity,
        suggestedAction,
      });
      
      throw geminiError;
    }
    
    // Upload image
    const uploadPath = `${productId}/${shotType}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(uploadPath, imageUrl);
    
    if (uploadError) {
      await logError({
        logId,
        errorType: 'api_error',
        errorCode: 'UPLOAD_FAILED',
        errorMessage: uploadError.message,
        severity: 'high',
        suggestedAction: 'Storage error - contact support',
      });
      throw uploadError;
    }
    
    // Success
    const duration = Date.now() - startTime;
    await logGeneration({
      productId,
      shotType,
      status: 'success',
      duration,
      imageUrl: uploadPath,
    });
    
    return json({
      success: true,
      imageUrl: `https://cdn.example.com/${uploadPath}`,
      duration,
    });
    
  } catch (err) {
    const duration = Date.now() - startTime;
    
    // Log final error
    await logError({
      logId,
      errorType: 'unknown',
      errorCode: err.code || 'UNKNOWN',
      errorMessage: err.message || 'Unknown error',
      severity: 'critical',
      suggestedAction: 'Unknown error - try a different photo',
    });
    
    // Return error to client
    return json({
      success: false,
      error: err.message,
      suggestedAction: 'Please try again or contact support',
      duration,
    }, { status: 500 });
  }
}
```

---

## 📊 **Phase 3: Monitoring Dashboard (SQL Queries)**

### **Real-time Success Rate**

```sql
-- Success rate in last hour
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate,
  COUNT(*) FILTER (WHERE status = 'failed') as failures
FROM image_generation_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY hour
ORDER BY hour DESC;
```

### **Error Breakdown**

```sql
-- What's failing and why?
SELECT
  error_type,
  error_code,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / 
    (SELECT COUNT(*) FROM image_generation_errors WHERE created_at > NOW() - INTERVAL '1 day'), 2) as percentage,
  MAX(created_at) as last_occurrence
FROM image_generation_errors
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY error_type, error_code
ORDER BY count DESC;
```

### **Retry Patterns**

```sql
-- How many retries are users needing?
SELECT
  product_id,
  COUNT(DISTINCT user_id) as users_affected,
  AVG(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failure_rate,
  MAX(attempt_number) as max_retries_needed,
  COUNT(*) FILTER (WHERE attempt_number >= 3) as users_needing_3plus_retries
FROM image_generation_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY product_id
HAVING COUNT(*) > 5
ORDER BY max_retries_needed DESC;
```

### **Device Breakdown**

```sql
-- Success rates by device type
SELECT
  device_type,
  os_name,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate,
  ROUND(AVG(duration_ms), 0) as avg_duration_ms
FROM image_generation_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY device_type, os_name
ORDER BY success_rate ASC;
```

---

## ⚠️ **Phase 4: Automated Alerts**

### **Create Alert Triggers**

```sql
-- Alert: Success rate drops below 90%
CREATE OR REPLACE FUNCTION check_success_rate_alert()
RETURNS void AS $$
DECLARE
  recent_success_rate DECIMAL;
BEGIN
  SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2)
  INTO recent_success_rate
  FROM image_generation_logs
  WHERE created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_success_rate < 90 THEN
    INSERT INTO qa_audit_results (
      audit_type, audit_name, status, score, alert_triggered, alert_severity
    ) VALUES (
      'hourly', 'success_rate_alert', 'failed', 
      ROUND(recent_success_rate::numeric), true, 'critical'
    );
    -- Send email alert to ops team
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run every hour
-- SELECT cron.schedule('check_success_rate', '0 * * * *', 'SELECT check_success_rate_alert()');
```

---

## 🎯 **Phase 5: Frontend Changes**

### **Show Better Error Messages**

Replace this:
```typescript
"Edge Function returned a non-2xx status code"
```

With this:
```typescript
const ERROR_MESSAGES = {
  '401': 'API authentication failed - contact support',
  '429': 'API rate limited - please try again in 30 seconds',
  '500': 'API service temporarily unavailable - try again soon',
  'TIMEOUT': 'Request took too long - try a different photo',
  'FACE_NOT_DETECTED': 'Face not detected - try better lighting or a clearer photo',
  'FRAME_FIT_FAILED': 'Frame fit calculation failed - try a different frame',
  'MEMORY_ERROR': 'Device low on memory - close other apps',
  'NETWORK_ERROR': 'Network connection lost - check internet and retry',
};

// When error occurs:
const suggestedAction = ERROR_MESSAGES[errorCode] || 'Try again or contact support';
showUserError(suggestedAction);
```

---

## 📈 **Success Metrics (Track These)**

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Virtual Try-On Success Rate | 60% | 95% | 2 weeks |
| Average Retries Per User | 3.2 | 1.2 | 2 weeks |
| Error Detection Time | Manual | <1 min | 1 week |
| Mean Time to Fix | 4+ hours | <30 min | 3 weeks |
| User Satisfaction (NPS) | +30 | +60 | 3 weeks |

---

## 🚀 **Implementation Checklist**

- [ ] Create all 5 database tables
- [ ] Add logging code to Edge Function
- [ ] Add error classification logic
- [ ] Test logging with sample generations
- [ ] Create monitoring dashboard queries
- [ ] Set up alert thresholds
- [ ] Update frontend error messages
- [ ] Create ops runbook for alerts
- [ ] Train team on monitoring dashboard
- [ ] Set up daily QA audit checks

---

## 📞 **Next Steps**

1. **Week 1**: Create tables + implement logging
2. **Week 2**: Deploy, collect data, refine
3. **Week 3**: Add alerting + dashboard
4. **Week 4**: Optimize based on metrics

Ready to start? 🚀

