import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/review-queue/[id]/resolve - Resolve a flagged low-confidence AI entry
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, finalResult, agentName } = body; // status: 'resolved' | 'dismissed', finalResult: corrected diagnosis or eligibility

    if (!status || !finalResult) {
      return NextResponse.json({ error: 'Missing resolution status or result details' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the ReviewQueueItem
      const reviewItem = await tx.reviewQueueItem.findUnique({
        where: { id }
      });

      if (!reviewItem) {
        throw new Error('Review queue item not found');
      }

      // 2. Update ReviewQueueItem status
      const updatedItem = await tx.reviewQueueItem.update({
        where: { id },
        data: {
          status,
          assignedAgentId: agentName || 'Suresh Rao' // Mock agent
        }
      });

      let farmerId = '';
      let messageContent = '';

      // 3. Update the underlying record (CropDiagnosis or SchemeMatch)
      if (reviewItem.type === 'diagnosis') {
        const diagnosis = await tx.cropDiagnosis.update({
          where: { id: reviewItem.referenceId },
          data: {
            diagnosisResult: finalResult,
            humanReviewed: true,
            reviewedBy: agentName || 'Suresh Rao'
          },
          include: {
            crop: {
              include: {
                farm: true
              }
            }
          }
        });

        farmerId = diagnosis.crop.farm.farmerId;
        messageContent = `Expert Verification: Your crop health diagnosis has been updated to "${finalResult}" by Extension Officer Suresh Rao.`;

        // Update the crop status based on final diagnosis
        await tx.crop.update({
          where: { id: diagnosis.cropId },
          data: {
            status: finalResult.toLowerCase().includes('healthy') ? 'Healthy' : 'Diseased'
          }
        });
      }

      // 4. Send Notification to Farmer
      if (farmerId) {
        await tx.notification.create({
          data: {
            farmerId,
            type: 'harvest-risk',
            channel: 'in-app',
            content: messageContent
          }
        });
      }

      return updatedItem;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error resolving review queue item:', error);
    return NextResponse.json({ error: 'Failed to resolve item', details: error.message }, { status: 500 });
  }
}
