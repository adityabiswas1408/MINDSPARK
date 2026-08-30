import json, sys

sys.stdout.reconfigure(encoding='utf-8')
try:
    with open('A:\\MS\\files\\Claude_export_MINDSPARK tech stack and salvage assessment_b76639f4-9a92-4113-bb91-bbd06d11d7a6.filtered.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    with open('A:\\MS\\files\\temp_extract.txt', 'w', encoding='utf-8') as out:
        out.write(data.get('summary', '') + '\n\n---\n\n')
        messages = data.get('chat_messages', [])
        msg_start_idx = -1
        target_text = 'review this phase 4 prompt'
        
        for i, msg in enumerate(messages):
            text_content = ''
            for block in msg.get('content', []):
                if block.get('type') == 'text':
                    text_content += block.get('text', '')
            if text_content.strip().lower().startswith(target_text.lower()):
                msg_start_idx = i
                break
        
        if msg_start_idx != -1:
            out.write(f'FOUND VERBATIM AT INDEX {msg_start_idx} OF {len(messages)}\n\n')
            for i in range(msg_start_idx, len(messages)):
                m = messages[i]
                sender = m.get('sender', '')
                out.write(f'--- {sender.upper()} ---\n')
                for block in m.get('content', []):
                    if block.get('type') == 'text':
                        out.write(block.get('text', '') + '\n')
        else:
            out.write('VERBATIM NOT FOUND\n')
except Exception as e:
    print(f"Error: {e}")
