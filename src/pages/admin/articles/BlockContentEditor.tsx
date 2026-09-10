import { TextareaField, TextField } from './ArticleEditorComponents';
import { contentString, faqItemsText, parseContentRecord } from './forms';
import type { ArticleBlockType } from './types';

export function BlockContentEditor({
    blockType,
    contentJson,
    disabled,
    onChange,
}: {
    blockType: ArticleBlockType;
    contentJson: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    const content = parseContentRecord(contentJson);

    function updateTextField(key: string, value: string) {
        onChange(JSON.stringify({ ...content, [key]: value }, null, 2));
    }

    function updateFaqText(value: string) {
        const items = value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const [question, ...answerParts] = line.split('|');
                return {
                    question: question?.trim() ?? '',
                    answer: answerParts.join('|').trim(),
                };
            })
            .filter((item) => item.question || item.answer);

        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    const commonProps = { disabled };

    if (blockType === 'rich_text') {
        return (
            <TextareaField
                label="Article copy"
                value={contentString(content, 'body')}
                rows={8}
                onChange={(value) => updateTextField('body', value)}
                {...commonProps}
            />
        );
    }

    if (blockType === 'quote') {
        return (
            <div className="grid gap-4">
                <TextareaField
                    label="Quote"
                    value={contentString(content, 'quote')}
                    rows={4}
                    onChange={(value) => updateTextField('quote', value)}
                    {...commonProps}
                />
                <TextField
                    label="Attribution"
                    value={contentString(content, 'attribution')}
                    onChange={(value) => updateTextField('attribution', value)}
                    {...commonProps}
                />
            </div>
        );
    }

    if (blockType === 'callout') {
        return (
            <div className="grid gap-4">
                <TextField
                    label="Callout heading"
                    value={contentString(content, 'heading')}
                    onChange={(value) => updateTextField('heading', value)}
                    {...commonProps}
                />
                <TextareaField
                    label="Callout body"
                    value={contentString(content, 'body')}
                    rows={5}
                    onChange={(value) => updateTextField('body', value)}
                    {...commonProps}
                />
            </div>
        );
    }

    if (blockType === 'cta') {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <TextField
                    label="Button label"
                    value={contentString(content, 'label')}
                    onChange={(value) => updateTextField('label', value)}
                    {...commonProps}
                />
                <TextField
                    label="Button link"
                    value={contentString(content, 'href')}
                    onChange={(value) => updateTextField('href', value)}
                    {...commonProps}
                />
                <div className="md:col-span-2">
                    <TextareaField
                        label="Supporting copy"
                        value={contentString(content, 'body')}
                        rows={4}
                        onChange={(value) => updateTextField('body', value)}
                        {...commonProps}
                    />
                </div>
            </div>
        );
    }

    if (blockType === 'faq') {
        return (
            <div className="grid gap-3">
                <TextareaField
                    label="Questions and answers"
                    value={faqItemsText(content)}
                    rows={8}
                    onChange={updateFaqText}
                    {...commonProps}
                />
                <p className="text-sm leading-6 text-black/52">
                    Put one question per line. Use a vertical bar between question and answer, for example:
                    What is the lead time? | Usually 6-8 weeks after approval.
                </p>
            </div>
        );
    }

    if (blockType === 'proof_metric') {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <TextField
                    label="Metric value"
                    value={contentString(content, 'value')}
                    onChange={(value) => updateTextField('value', value)}
                    {...commonProps}
                />
                <TextField
                    label="Metric label"
                    value={contentString(content, 'label')}
                    onChange={(value) => updateTextField('label', value)}
                    {...commonProps}
                />
                <div className="md:col-span-2">
                    <TextareaField
                        label="Proof note"
                        value={contentString(content, 'note')}
                        rows={4}
                        onChange={(value) => updateTextField('note', value)}
                        {...commonProps}
                    />
                </div>
            </div>
        );
    }

    if (blockType === 'video_embed') {
        return (
            <div className="grid gap-4">
                <TextField
                    label="Approved video URL"
                    value={contentString(content, 'url')}
                    onChange={(value) => updateTextField('url', value)}
                    {...commonProps}
                />
                <TextareaField
                    label="Video caption"
                    value={contentString(content, 'caption')}
                    rows={4}
                    onChange={(value) => updateTextField('caption', value)}
                    {...commonProps}
                />
            </div>
        );
    }

    if (blockType === 'comparison_table') {
        return (
            <div className="grid gap-4">
                <TextField
                    label="Table heading"
                    value={contentString(content, 'heading')}
                    onChange={(value) => updateTextField('heading', value)}
                    {...commonProps}
                />
                <TextareaField
                    label="Column labels"
                    value={contentString(content, 'columnsText')}
                    rows={3}
                    onChange={(value) => updateTextField('columnsText', value)}
                    {...commonProps}
                />
                <TextareaField
                    label="Table body notes"
                    value={contentString(content, 'rowsText')}
                    rows={6}
                    onChange={(value) => updateTextField('rowsText', value)}
                    {...commonProps}
                />
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <TextareaField
                label={
                    blockType === 'image'
                        ? 'Image caption'
                        : blockType === 'gallery'
                            ? 'Gallery notes'
                            : blockType === 'project_spotlight'
                                ? 'Project supporting copy'
                                : blockType === 'stone_reference'
                                    ? 'Stone supporting copy'
                                    : 'Section copy'
                }
                value={contentString(content, 'body') || contentString(content, 'caption') || contentString(content, 'summary')}
                rows={6}
                onChange={(value) => updateTextField(blockType === 'image' ? 'caption' : 'body', value)}
                {...commonProps}
            />
            {blockType === 'image' || blockType === 'gallery' ? (
                <TextField
                    label="Layout note"
                    value={contentString(content, 'layout')}
                    onChange={(value) => updateTextField('layout', value)}
                    {...commonProps}
                />
            ) : null}
        </div>
    );
}
